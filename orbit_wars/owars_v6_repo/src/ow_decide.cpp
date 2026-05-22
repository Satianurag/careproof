// ow_decide.cpp -- Coordinated-attack candidate generator with pressure-aware
// multi-source allocation and de-duplicated launch commitment.

#include "ow_decide.hpp"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <limits>
#include <optional>
#include <unordered_map>
#include <utility>
#include <vector>

#include "ow_constants.hpp"
#include "ow_math.hpp"
#include "ow_timeline.hpp"
#include "ow_types.hpp"

namespace ow {

namespace {

using Clock = std::chrono::steady_clock;

constexpr int MAX_DT = 30;
constexpr int FORECAST_HORIZON = 32;
constexpr double DUPLICATE_ANGLE_EPS = 0.12;
constexpr int32_t MIN_PURPOSEFUL_DUPLICATE = 6;

struct SourceAlloc {
    int32_t src_id;
    int32_t ships;
    double angle;
};

struct Plan {
    int32_t tgt_id;
    int dt;
    std::vector<SourceAlloc> sources;
    int32_t total_ships;
    int32_t required_ships;
    double value;
    double roi;
    bool defensive;
};

struct SourceCost {
    int32_t src_id;
    int32_t min_ships;
    int32_t can_send;
    double angle;
};

struct TargetPressure {
    int32_t friendly;
    int32_t enemy;
};

// Smallest fleet size n such that fleet_speed(n) * dt + tgt_radius >= dist.
// Returns INT32_MAX if no n <= max_n satisfies the constraint.
[[maybe_unused]] int32_t min_ships_for_arrival(double dist, double target_radius, int dt,
                                               double max_speed, int32_t max_n) {
    if (max_n < 1) return std::numeric_limits<int32_t>::max();
    const double need_speed = (dist - target_radius) / static_cast<double>(dt);
    if (need_speed <= 1.0) return 1;
    if (need_speed >= max_speed) return std::numeric_limits<int32_t>::max();
    // fleet_speed(n) = 1 + (max_speed-1) * (log(n)/log(1000))^1.5
    // Invert closed-form, then walk up to satisfy ceil rounding.
    const double r = (need_speed - 1.0) / (max_speed - 1.0);
    const double log_ratio = std::pow(r, 2.0 / 3.0);
    const double n_d = std::exp(log_ratio * std::log(1000.0));
    int32_t n = static_cast<int32_t>(std::ceil(n_d));
    if (n < 1) n = 1;
    while (n <= max_n && fleet_speed(n, max_speed) * dt + target_radius < dist) {
        ++n;
    }
    if (n > max_n) return std::numeric_limits<int32_t>::max();
    return n;
}

// Defensive reserve a planet should keep at home.
[[maybe_unused]] int32_t defensive_reserve(const Planet& p, int32_t nearest_enemy_force) {
    // Base reserve scales with production so high-prod planets keep enough
    // to absorb a snap attack. We also pin the reserve to the strongest
    // nearby enemy concentration; planets adjacent to a heavy stack
    // cannot sit at low garrisons or they get steamrolled.
    const int32_t base = std::max<int32_t>(3, p.production * 5);
    const int32_t threat = std::max<int32_t>(0, nearest_enemy_force * 3 / 4);
    return std::min<int32_t>(p.ships, std::max<int32_t>(base, threat));
}

[[maybe_unused]] double angular_distance(double a, double b) {
    return std::abs(std::atan2(std::sin(a - b), std::cos(a - b)));
}

[[maybe_unused]] bool is_redundant_weak_duplicate(const std::vector<SourceAlloc>& existing,
                                                   const SourceAlloc& candidate) {
    for (const auto& e : existing) {
        if (angular_distance(e.angle, candidate.angle) > DUPLICATE_ANGLE_EPS) continue;
        const int32_t weaker = std::min(e.ships, candidate.ships);
        const int32_t stronger = std::max(e.ships, candidate.ships);
        if (weaker <= 3) return true;
        if (weaker <= MIN_PURPOSEFUL_DUPLICATE && stronger >= weaker * 2) return true;
    }
    return false;
}

[[maybe_unused]] bool plans_are_near_duplicates(const Plan& a, const Plan& b) {
    if (a.tgt_id != b.tgt_id) return false;
    if (std::abs(a.dt - b.dt) > 2) return false;
    if (std::abs(a.total_ships - b.total_ships) > 4) return false;

    int shared_sources = 0;
    for (const auto& sa : a.sources) {
        for (const auto& sb : b.sources) {
            if (sa.src_id == sb.src_id) {
                ++shared_sources;
                break;
            }
        }
    }
    const int min_sources = static_cast<int>(std::min(a.sources.size(), b.sources.size()));
    return shared_sources >= std::max(1, min_sources - 1);
}

[[maybe_unused]] TargetPressure estimate_target_pressure(const Observation& state,
                                                         int32_t pid,
                                                         const Planet& tgt) {
    TargetPressure out{0, 0};
    const double max_d = state.ship_speed * MAX_DT;
    for (const auto& p : state.planets) {
        if (p.id == tgt.id) continue;
        if (p.owner < 0) continue;
        const double d = std::hypot(p.x - tgt.x, p.y - tgt.y);
        if (d > max_d) continue;
        if (segment_hits_sun(p.x, p.y, tgt.x, tgt.y)) continue;

        const double weight = std::max(0.15, 1.0 - d / max_d);
        const int32_t contribution =
            static_cast<int32_t>(std::round(static_cast<double>(p.ships) * weight));
        if (contribution <= 0) continue;

        if (p.owner == pid) {
            out.friendly += contribution;
        } else {
            out.enemy += contribution;
        }
    }
    return out;
}

[[maybe_unused]] std::optional<Plan> build_attack_plan(
    const Observation& state,
    const Forecast& forecast,
    const std::unordered_map<int32_t, const Planet*>& by_id,
    const std::unordered_map<int32_t, int32_t>& spare,
    const Planet& tgt,
    const TargetPressure& pressure,
    int dt) {
    const PlanetSnapshot* tgt_snap = lookup(forecast, tgt.id, dt);
    if (tgt_snap == nullptr) return std::nullopt;

    const int32_t pid = state.pid;
    if (tgt_snap->owner == pid) return std::nullopt;  // own targets handled by defensive path

    const int32_t base_required = tgt_snap->ships + 1;
    if (base_required <= 0) return std::nullopt;

    int32_t hold_buffer = std::max<int32_t>(1, tgt.production * 2);
    if (tgt_snap->owner == -1) {
        hold_buffer = std::max<int32_t>(1, hold_buffer / 2);
    } else {
        hold_buffer += std::max<int32_t>(0, pressure.enemy - pressure.friendly) / 5;
        hold_buffer += std::max<int32_t>(0, tgt_snap->ships / 5);
    }
    const int32_t required = base_required + hold_buffer;

    const double tx = tgt_snap->x;
    const double ty = tgt_snap->y;

    std::vector<SourceCost> sources;
    sources.reserve(state.planets.size());
    int32_t total_possible = 0;
    for (const auto& kv : spare) {
        const int32_t src_id = kv.first;
        const int32_t can_send = kv.second;
        if (src_id == tgt.id) continue;
        if (can_send <= 1) continue;

        auto it = by_id.find(src_id);
        if (it == by_id.end()) continue;
        const Planet* src = it->second;

        const double dx = tx - src->x;
        const double dy = ty - src->y;
        const double dist = std::sqrt(dx * dx + dy * dy);
        if (segment_hits_sun(src->x, src->y, tx, ty)) continue;

        const int32_t min_n =
            min_ships_for_arrival(dist, tgt.radius, dt, state.ship_speed, can_send);
        if (min_n > can_send) continue;

        sources.push_back(SourceCost{src_id, min_n, can_send, std::atan2(dy, dx)});
        total_possible += can_send;
    }
    if (sources.empty()) return std::nullopt;
    if (total_possible < required) return std::nullopt;

    // Prefer low launch-threshold sources first, then high capacity.
    std::sort(sources.begin(), sources.end(),
              [](const SourceCost& a, const SourceCost& b) {
                  if (a.min_ships != b.min_ships) return a.min_ships < b.min_ships;
                  return a.can_send > b.can_send;
              });

    int desired_sources = 1;
    if (required >= 10 || tgt.production >= 4) desired_sources = 2;
    if (required >= 18 || tgt.production >= 6) desired_sources = 3;
    if (required >= 30 || pressure.enemy > pressure.friendly) desired_sources = 4;
    desired_sources = std::min<int>(desired_sources, static_cast<int>(sources.size()));

    int32_t total = 0;
    std::vector<SourceAlloc> allocs;
    allocs.reserve(sources.size());

    for (int i = 0; i < desired_sources; ++i) {
        const auto& s = sources[static_cast<size_t>(i)];
        allocs.push_back(SourceAlloc{s.src_id, s.min_ships, s.angle});
        total += s.min_ships;
    }

    for (size_t i = static_cast<size_t>(desired_sources);
         i < sources.size() && total < required;
         ++i) {
        const auto& s = sources[i];
        int32_t send = std::max<int32_t>(s.min_ships, required - total);
        if (send > s.can_send) send = s.can_send;
        if (send < s.min_ships) continue;
        allocs.push_back(SourceAlloc{s.src_id, send, s.angle});
        total += send;
    }

    const auto find_source = [&](int32_t src_id) -> const SourceCost* {
        for (const auto& s : sources) {
            if (s.src_id == src_id) return &s;
        }
        return nullptr;
    };

    for (auto& a : allocs) {
        if (total >= required) break;
        const SourceCost* s = find_source(a.src_id);
        if (s == nullptr) continue;
        const int32_t room = s->can_send - a.ships;
        if (room <= 0) continue;
        const int32_t add = std::min<int32_t>(room, required - total);
        a.ships += add;
        total += add;
    }

    if (total < required) return std::nullopt;

    int32_t pressure_bonus = 0;
    if (tgt_snap->owner != -1 && tgt_snap->owner != pid) {
        pressure_bonus = std::max<int32_t>(2, tgt.production * 2);
        pressure_bonus += std::max<int32_t>(0, pressure.enemy - pressure.friendly) / 6;
    } else {
        pressure_bonus = std::max<int32_t>(1, tgt.production);
    }

    int32_t pressure_goal = required + pressure_bonus;
    pressure_goal = std::min<int32_t>(pressure_goal,
                                      required + std::max<int32_t>(4, required / 2));
    pressure_goal = std::min<int32_t>(pressure_goal, total_possible);

    const int32_t soft_cap =
        std::max<int32_t>(3, pressure_goal / std::max(1, desired_sources) + tgt.production);
    bool grew = true;
    while (total < pressure_goal && grew) {
        grew = false;
        const int32_t remaining = pressure_goal - total;
        const int32_t chunk =
            std::max<int32_t>(1,
                              (remaining + static_cast<int32_t>(allocs.size()) - 1)
                                  / std::max<int32_t>(1, static_cast<int32_t>(allocs.size())));
        for (auto& a : allocs) {
            const SourceCost* s = find_source(a.src_id);
            if (s == nullptr) continue;
            const int32_t cap = std::min<int32_t>(s->can_send, soft_cap);
            if (a.ships >= cap) continue;
            const int32_t add = std::min<int32_t>(cap - a.ships, chunk);
            if (add <= 0) continue;
            a.ships += add;
            total += add;
            grew = true;
            if (total >= pressure_goal) break;
        }
    }

    for (const auto& s : sources) {
        if (total >= pressure_goal) break;
        bool already_used = false;
        for (const auto& a : allocs) {
            if (a.src_id == s.src_id) {
                already_used = true;
                break;
            }
        }
        if (already_used) continue;

        int32_t send = std::max<int32_t>(s.min_ships, pressure_goal - total);
        if (send > s.can_send) send = s.can_send;
        if (send < s.min_ships) continue;
        allocs.push_back(SourceAlloc{s.src_id, send, s.angle});
        total += send;
    }

    const int remaining_ticks = std::max(1, state.episode_steps - state.step - dt);
    // Cap forward valuation: production gains are uncertain past ~150
    // ticks (the opponent may take it back, or the game may end).
    const int effective_horizon = std::min(remaining_ticks, 150);

    double future_mult = 1.0;
    int32_t kill_bonus = 0;
    if (tgt_snap->owner != -1 && tgt_snap->owner != pid) {
        // Stealing from an opponent: we gain their production AND deny
        // their use of it. Destroying the projected garrison is also a
        // direct material swing.
        future_mult = 2.6;
        kill_bonus = tgt_snap->ships;
    }

    const double future = static_cast<double>(tgt.production)
                          * static_cast<double>(effective_horizon)
                          * future_mult;
    const double pressure_value =
        static_cast<double>(std::max<int32_t>(0, total - required)) * 0.35;
    const double coordination_value =
        static_cast<double>(std::max<int>(0, static_cast<int>(allocs.size()) - 1))
        * (0.8 + 0.2 * static_cast<double>(tgt.production));

    // Ship cost reflects the opportunity cost of removing those ships
    // from our defense pool; dt is the time-value penalty.
    const double cost = static_cast<double>(total) * 0.72
                        + static_cast<double>(dt) * 0.22 * tgt.production;
    const double value =
        future + static_cast<double>(kill_bonus) * 1.6 + pressure_value + coordination_value - cost;
    if (value <= 0.0) return std::nullopt;

    Plan p;
    p.tgt_id = tgt.id;
    p.dt = dt;
    p.sources = std::move(allocs);
    p.total_ships = total;
    p.required_ships = required;
    p.value = value;
    p.roi = value / std::max<int32_t>(1, total);
    p.defensive = false;
    return p;
}

[[maybe_unused]] std::optional<Plan> build_defensive_plan(
    const Observation& state,
    const Forecast& forecast,
    const std::unordered_map<int32_t, const Planet*>& by_id,
    const std::unordered_map<int32_t, int32_t>& spare,
    const Planet& tgt) {
    const int32_t pid = state.pid;

    // Find the first tick the planet flips, and the strongest hostile
    // contribution. The forecast snapshot post-combat tells us the new
    // owner; we estimate the attacker force as the surplus over our
    // pre-combat garrison.
    int flip_tick = -1;
    int32_t attacker_force = 0;
    int32_t our_pre_combat = tgt.ships;
    for (int t = 1; t <= MAX_DT; ++t) {
        const PlanetSnapshot* s = lookup(forecast, tgt.id, t);
        const PlanetSnapshot* prev = lookup(forecast, tgt.id, t - 1);
        if (s == nullptr || prev == nullptr) break;
        if (prev->owner == pid && s->owner != pid) {
            flip_tick = t;
            // attacker ships = our_garrison_pre_combat + (s->ships) (the
            // attacker keeps the difference between their force and our
            // garrison). Conservatively assume attacker has prev->ships +
            // s->ships + production.
            our_pre_combat = prev->ships + ((prev->owner == pid) ? tgt.production : 0);
            attacker_force = our_pre_combat + s->ships;
            break;
        }
    }
    if (flip_tick < 0) return std::nullopt;

    // We must reinforce by `flip_tick`. The required reinforcement is
    // attacker_force - our_pre_combat + 1 (so we end with at least 1 ship).
    int32_t required = attacker_force - our_pre_combat + 1;
    if (required <= 0) return std::nullopt;

    const double tx = tgt.x;
    const double ty = tgt.y;

    std::vector<SourceCost> sources;
    sources.reserve(state.planets.size());
    for (const auto& kv : spare) {
        const int32_t src_id = kv.first;
        const int32_t can_send = kv.second;
        if (src_id == tgt.id) continue;
        if (can_send <= 1) continue;

        auto it = by_id.find(src_id);
        if (it == by_id.end()) continue;
        const Planet* src = it->second;

        const double dx = tx - src->x;
        const double dy = ty - src->y;
        const double dist = std::sqrt(dx * dx + dy * dy);
        if (segment_hits_sun(src->x, src->y, tx, ty)) continue;

        const int32_t min_n =
            min_ships_for_arrival(dist, tgt.radius, flip_tick, state.ship_speed, can_send);
        if (min_n > can_send) continue;

        sources.push_back(SourceCost{src_id, min_n, can_send, std::atan2(dy, dx)});
    }
    if (sources.empty()) return std::nullopt;

    std::sort(sources.begin(), sources.end(),
              [](const SourceCost& a, const SourceCost& b) {
                  if (a.min_ships != b.min_ships) return a.min_ships < b.min_ships;
                  return a.can_send > b.can_send;
              });

    int32_t total = 0;
    std::vector<SourceAlloc> allocs;
    for (const auto& s : sources) {
        if (total >= required) break;
        const int32_t need_more = required - total;
        int32_t send = std::max(s.min_ships, need_more);
        if (send > s.can_send) send = s.can_send;
        if (send < s.min_ships) continue;
        allocs.push_back(SourceAlloc{s.src_id, send, s.angle});
        total += send;
    }
    if (total < required) return std::nullopt;

    const int remaining = std::max(1, state.episode_steps - state.step - flip_tick);
    // Defensive value: keeping the planet preserves its production AND
    // denies the opponent the attacker_force - required ships they would
    // have used to capture it.
    const double future = static_cast<double>(tgt.production) * static_cast<double>(remaining);
    const double cost = static_cast<double>(total) * 0.5;
    const double value = future - cost;
    if (value <= 0.0) return std::nullopt;

    Plan p;
    p.tgt_id = tgt.id;
    p.dt = flip_tick;
    p.sources = std::move(allocs);
    p.total_ships = total;
    p.required_ships = required;
    p.value = value;
    p.roi = value / std::max<int32_t>(1, total);
    p.defensive = true;
    return p;
}

}  // namespace

std::vector<Move> decide(const Observation& state, double time_budget_ms) {
    const auto deadline = Clock::now() +
                          std::chrono::microseconds(static_cast<int64_t>(time_budget_ms * 1000.0));

    const int32_t pid = state.pid;
    if (pid < 0 || pid >= state.num_agents) return {};
    if (state.planets.empty()) return {};

    const Forecast forecast = build_forecast(state, FORECAST_HORIZON);

    std::unordered_map<int32_t, const Planet*> by_id;
    std::unordered_map<int32_t, int32_t> spare;
    by_id.reserve(state.planets.size() * 2);
    spare.reserve(state.planets.size() * 2);

    // Precompute the nearest hostile concentration for each own planet so
    // the defensive reserve can scale with proximity to threat.
    std::unordered_map<int32_t, int32_t> nearest_enemy_force;
    nearest_enemy_force.reserve(state.planets.size());

    for (const auto& p : state.planets) {
        by_id[p.id] = &p;
        if (p.owner != pid) continue;
        int32_t best = 0;
        for (const auto& q : state.planets) {
            if (q.owner < 0 || q.owner == pid) continue;
            const double d = std::hypot(q.x - p.x, q.y - p.y);
            if (d > state.ship_speed * MAX_DT) continue;
            const double weight = std::max(0.2, 1.0 - d / (state.ship_speed * MAX_DT));
            const int32_t contribution = static_cast<int32_t>(q.ships * weight);
            if (contribution > best) best = contribution;
        }
        nearest_enemy_force[p.id] = best;
    }

    for (const auto& p : state.planets) {
        if (p.owner != pid) continue;
        const int32_t reserve = defensive_reserve(p, nearest_enemy_force[p.id]);
        spare[p.id] = std::max<int32_t>(0, p.ships - reserve);
    }
    if (spare.empty()) return {};

    std::unordered_map<int32_t, TargetPressure> target_pressure;
    target_pressure.reserve(state.planets.size() * 2);
    for (const auto& tgt : state.planets) {
        target_pressure[tgt.id] = estimate_target_pressure(state, pid, tgt);
    }

    std::vector<Plan> plans;
    plans.reserve(state.planets.size() * 3);

    // Build ATTACK plans per non-own target:
    // - best ROI candidate
    // - best raw-value candidate (if materially distinct)
    for (const auto& tgt : state.planets) {
        if (tgt.owner == pid) continue;
        std::optional<Plan> best_roi;
        std::optional<Plan> best_value;

        const auto pressure_it = target_pressure.find(tgt.id);
        const TargetPressure pressure =
            (pressure_it == target_pressure.end()) ? TargetPressure{0, 0} : pressure_it->second;

        for (int dt = 1; dt <= MAX_DT; ++dt) {
            if (Clock::now() > deadline) break;
            auto p = build_attack_plan(state, forecast, by_id, spare, tgt, pressure, dt);
            if (!p.has_value()) continue;
            if (!best_roi.has_value() || p->roi > best_roi->roi) {
                best_roi = p;
            }
            if (!best_value.has_value() || p->value > best_value->value) {
                best_value = p;
            }
        }

        if (best_roi.has_value()) {
            plans.push_back(*best_roi);
        }
        if (best_value.has_value()
            && (!best_roi.has_value() || !plans_are_near_duplicates(*best_roi, *best_value))) {
            plans.push_back(*best_value);
        }

        if (Clock::now() > deadline) break;
    }

    // Build DEFENSIVE plan per own threatened planet.
    for (const auto& tgt : state.planets) {
        if (tgt.owner != pid) continue;
        if (Clock::now() > deadline) break;
        auto p = build_defensive_plan(state, forecast, by_id, spare, tgt);
        if (p.has_value()) plans.push_back(*p);
    }

    // Defensive plans get a priority bump so they don't lose to attacks
    // when budgets are tight.
    for (auto& p : plans) {
        if (p.defensive) {
            p.roi += 120.0;
            p.value += 5000.0;
        }
    }

    std::sort(plans.begin(), plans.end(),
              [](const Plan& a, const Plan& b) {
                  if (a.defensive != b.defensive) return a.defensive > b.defensive;
                  if (a.roi != b.roi) return a.roi > b.roi;
                  if (a.value != b.value) return a.value > b.value;
                  return a.required_ships > b.required_ships;
              });

    std::vector<Move> committed;
    committed.reserve(plans.size() * 3);

    std::unordered_map<int32_t, int32_t> committed_to_target;
    std::unordered_map<int32_t, int32_t> commits_per_target;
    std::unordered_map<int32_t, std::vector<SourceAlloc>> launches_by_source;
    committed_to_target.reserve(state.planets.size() * 2);
    commits_per_target.reserve(state.planets.size() * 2);
    launches_by_source.reserve(spare.size() * 2);

    for (const auto& p : plans) {
        const int32_t already = committed_to_target[p.tgt_id];
        if (already >= p.required_ships) continue;
        if (!p.defensive && commits_per_target[p.tgt_id] >= 2) continue;

        bool resources_ok = true;
        int32_t effective_total = 0;
        std::vector<SourceAlloc> filtered;
        filtered.reserve(p.sources.size());

        for (const auto& s : p.sources) {
            if (spare[s.src_id] < s.ships) {
                resources_ok = false;
                break;
            }

            bool redundant = false;
            const auto it = launches_by_source.find(s.src_id);
            if (!p.defensive && it != launches_by_source.end()) {
                redundant = is_redundant_weak_duplicate(it->second, s);
            }
            if (redundant) continue;

            filtered.push_back(s);
            effective_total += s.ships;
        }

        if (!resources_ok) continue;

        const int32_t needed_now = std::max<int32_t>(1, p.required_ships - already);
        if (effective_total < needed_now) continue;

        for (const auto& s : filtered) {
            committed.push_back(Move{s.src_id, s.angle, s.ships});
            spare[s.src_id] -= s.ships;
            launches_by_source[s.src_id].push_back(s);
        }

        committed_to_target[p.tgt_id] += effective_total;
        commits_per_target[p.tgt_id] += 1;
    }

    return committed;
}

}  // namespace ow
