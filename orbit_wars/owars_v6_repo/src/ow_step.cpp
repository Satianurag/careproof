// ow_step.cpp -- See header. Each numbered block below mirrors a section
// of orbit_wars.py's interpreter() so reviewers can diff line-by-line.

#include "ow_step.hpp"

#include <algorithm>
#include <array>
#include <cmath>
#include <unordered_map>

#include "ow_constants.hpp"
#include "ow_math.hpp"

namespace ow {

namespace {

// Local view of a planet's same-tick path. check_collision==false flags
// planets that appear mid-tick (first comet placement) and must NOT be
// tested for fleet collisions during this tick.
struct PlanetPath {
    double old_x, old_y;
    double new_x, new_y;
    bool check_collision;
};

}  // namespace

StepResult step(Observation& state, const std::vector<std::vector<Move>>& actions) {
    // 0a. Expire comets whose path has run out, BEFORE fleet launch, so
    //     the agent's moves cannot reference a planet that no longer
    //     exists. (orbit_wars.py: "Remove expired comets before fleet
    //     launch so agents can't act on them".)
    {
        std::vector<int32_t> expired;
        expired.reserve(8);
        for (const auto& g : state.comets) {
            const int idx = g.path_index;
            for (size_t i = 0; i < g.planet_ids.size(); ++i) {
                if (idx >= 0 && static_cast<size_t>(idx) >= g.paths[i].size()) {
                    expired.push_back(g.planet_ids[i]);
                }
            }
        }
        if (!expired.empty()) {
            const auto is_expired = [&](int32_t pid) {
                return std::find(expired.begin(), expired.end(), pid) != expired.end();
            };
            state.planets.erase(
                std::remove_if(state.planets.begin(), state.planets.end(),
                               [&](const Planet& p) { return is_expired(p.id); }),
                state.planets.end());
            state.initial_planets.erase(
                std::remove_if(state.initial_planets.begin(), state.initial_planets.end(),
                               [&](const Planet& p) { return is_expired(p.id); }),
                state.initial_planets.end());
            for (auto& g : state.comets) {
                g.planet_ids.erase(
                    std::remove_if(g.planet_ids.begin(), g.planet_ids.end(),
                                   [&](int32_t pid) { return is_expired(pid); }),
                    g.planet_ids.end());
            }
            state.comets.erase(
                std::remove_if(state.comets.begin(), state.comets.end(),
                               [](const CometGroup& g) { return g.planet_ids.empty(); }),
                state.comets.end());
        }
    }

    // 0b. Fleet Launch. We mirror the engine's per-player order so that if
    //     two players try to consume the same garrison they're processed
    //     deterministically (player 0 first, then 1, etc.).
    for (size_t pid = 0; pid < actions.size(); ++pid) {
        for (const Move& mv : actions[pid]) {
            if (mv.ships <= 0) continue;
            Planet* src = nullptr;
            for (auto& p : state.planets) {
                if (p.id == mv.from_planet_id) {
                    src = &p;
                    break;
                }
            }
            if (src == nullptr) continue;
            if (src->owner != static_cast<int32_t>(pid)) continue;
            if (src->ships < mv.ships) continue;

            src->ships -= mv.ships;
            const double sx = src->x + std::cos(mv.angle) * (src->radius + 0.1);
            const double sy = src->y + std::sin(mv.angle) * (src->radius + 0.1);
            state.fleets.push_back(Fleet{
                state.next_fleet_id,
                static_cast<int32_t>(pid),
                sx, sy,
                mv.angle,
                src->id,
                mv.ships,
            });
            ++state.next_fleet_id;
        }
    }

    // 1. Production. Owned planets (including owned comets) gain ships.
    for (auto& p : state.planets) {
        if (p.owner != -1) {
            p.ships += p.production;
        }
    }

    // 2. Compute each planet's end-of-tick position so fleet movement uses
    //    a swept-pair (continuous) test that accounts for both moving.
    //    `step` here is the CURRENT step (the engine increments after).
    std::unordered_map<int32_t, PlanetPath> planet_paths;
    planet_paths.reserve(state.planets.size() * 2);
    std::vector<int32_t> expired_comets_this_tick;

    {
        // Build a map from planet id -> initial planet for rotation math.
        std::unordered_map<int32_t, const Planet*> initial_by_id;
        initial_by_id.reserve(state.initial_planets.size() * 2);
        for (const auto& ip : state.initial_planets) {
            initial_by_id[ip.id] = &ip;
        }

        for (const auto& p : state.planets) {
            if (p.is_comet) continue;
            double nx = p.x, ny = p.y;
            const auto it = initial_by_id.find(p.id);
            if (it != initial_by_id.end()) {
                const Planet& ip = *it->second;
                const double dx = ip.x - CENTER;
                const double dy = ip.y - CENTER;
                const double r = std::sqrt(dx * dx + dy * dy);
                if (r + p.radius < ROTATION_RADIUS_LIMIT) {
                    const double a0 = std::atan2(dy, dx);
                    const double a = a0 + state.angular_velocity * state.step;
                    nx = CENTER + r * std::cos(a);
                    ny = CENTER + r * std::sin(a);
                }
            }
            planet_paths[p.id] = PlanetPath{p.x, p.y, nx, ny, true};
        }

        // Comets: advance path_index, then look up next waypoint.
        for (auto& g : state.comets) {
            g.path_index += 1;
            const int idx = g.path_index;
            for (size_t i = 0; i < g.planet_ids.size(); ++i) {
                const int32_t pid = g.planet_ids[i];
                Planet* p = nullptr;
                for (auto& cand : state.planets) {
                    if (cand.id == pid) { p = &cand; break; }
                }
                if (p == nullptr) continue;
                const auto& ppath = g.paths[i];
                if (idx >= static_cast<int>(ppath.size())) {
                    // Expired: stays put this tick, removed after combat.
                    expired_comets_this_tick.push_back(pid);
                    planet_paths[pid] = PlanetPath{p->x, p->y, p->x, p->y, true};
                } else {
                    const double nx = ppath[idx][0];
                    const double ny = ppath[idx][1];
                    // First placement uses off-board placeholder (-99,-99)
                    // and skips collision check for this tick.
                    const bool check = (p->x >= 0.0);
                    planet_paths[pid] = PlanetPath{p->x, p->y, nx, ny, check};
                }
            }
        }
    }

    // 3. Fleet movement with continuous swept-pair collision.
    //    Per-planet combat lists: pid -> fleets arriving this tick.
    std::unordered_map<int32_t, std::vector<Fleet>> combat_lists;
    combat_lists.reserve(state.planets.size() * 2);
    for (const auto& p : state.planets) combat_lists[p.id] = {};

    std::vector<int> survive(state.fleets.size(), 1);

    for (size_t fi = 0; fi < state.fleets.size(); ++fi) {
        Fleet& f = state.fleets[fi];
        const double sp = fleet_speed(f.ships, state.ship_speed);
        const double ox = f.x, oy = f.y;
        f.x += std::cos(f.angle) * sp;
        f.y += std::sin(f.angle) * sp;
        const double nx = f.x, ny = f.y;

        bool hit = false;
        for (const auto& p : state.planets) {
            const auto it = planet_paths.find(p.id);
            if (it == planet_paths.end() || !it->second.check_collision) continue;
            const auto& pp = it->second;
            if (swept_pair_hit(ox, oy, nx, ny, pp.old_x, pp.old_y, pp.new_x, pp.new_y, p.radius)) {
                combat_lists[p.id].push_back(f);
                survive[fi] = 0;
                hit = true;
                break;
            }
        }
        if (hit) continue;

        // OOB and sun checks. Order matches reference: planet hit takes
        // priority (we already returned above on hit).
        if (f.x < 0.0 || f.x > BOARD_SIZE || f.y < 0.0 || f.y > BOARD_SIZE) {
            survive[fi] = 0;
            continue;
        }
        if (point_to_segment_distance(CENTER, CENTER, ox, oy, nx, ny) < SUN_RADIUS) {
            survive[fi] = 0;
        }
    }

    // 4. Apply planet movement.
    for (auto& p : state.planets) {
        const auto it = planet_paths.find(p.id);
        if (it != planet_paths.end()) {
            p.x = it->second.new_x;
            p.y = it->second.new_y;
        }
    }

    // 4b. Drop expired comets (they've already participated in any
    //     combat above and stayed put).
    if (!expired_comets_this_tick.empty()) {
        const auto is_dead = [&](int32_t pid) {
            return std::find(expired_comets_this_tick.begin(),
                             expired_comets_this_tick.end(),
                             pid) != expired_comets_this_tick.end();
        };
        state.planets.erase(
            std::remove_if(state.planets.begin(), state.planets.end(),
                           [&](const Planet& p) { return is_dead(p.id); }),
            state.planets.end());
        state.initial_planets.erase(
            std::remove_if(state.initial_planets.begin(), state.initial_planets.end(),
                           [&](const Planet& p) { return is_dead(p.id); }),
            state.initial_planets.end());
        for (auto& g : state.comets) {
            g.planet_ids.erase(
                std::remove_if(g.planet_ids.begin(), g.planet_ids.end(),
                               [&](int32_t pid) { return is_dead(pid); }),
                g.planet_ids.end());
        }
        state.comets.erase(
            std::remove_if(state.comets.begin(), state.comets.end(),
                           [](const CometGroup& g) { return g.planet_ids.empty(); }),
            state.comets.end());
    }

    // Drop fleets that died this tick.
    {
        std::vector<Fleet> kept;
        kept.reserve(state.fleets.size());
        for (size_t i = 0; i < state.fleets.size(); ++i) {
            if (survive[i]) kept.push_back(state.fleets[i]);
        }
        state.fleets = std::move(kept);
    }

    // 5. Combat Resolution. Largest fleet wins by (top - second);
    //    ties at top => mutual destruction. Survivors clash with the
    //    planet's existing garrison.
    int32_t total_arrivals = 0;
    for (auto& kv : combat_lists) {
        const int32_t pid = kv.first;
        auto& fleets = kv.second;
        if (fleets.empty()) continue;
        total_arrivals += static_cast<int32_t>(fleets.size());

        Planet* planet = nullptr;
        for (auto& p : state.planets) {
            if (p.id == pid) { planet = &p; break; }
        }
        if (planet == nullptr) continue;

        std::array<int32_t, MAX_PLAYERS> player_ships{};
        player_ships.fill(0);
        for (const auto& f : fleets) {
            if (f.owner >= 0 && f.owner < MAX_PLAYERS) {
                player_ships[f.owner] += f.ships;
            }
        }
        int32_t top_pid = -1, top_n = 0, second_n = 0;
        for (int32_t p = 0; p < MAX_PLAYERS; ++p) {
            const int32_t v = player_ships[p];
            if (v <= 0) continue;
            if (v > top_n) {
                second_n = top_n;
                top_n = v;
                top_pid = p;
            } else if (v == top_n) {
                second_n = v;
            } else if (v > second_n) {
                second_n = v;
            }
        }
        if (top_pid < 0) continue;

        int32_t survivors = top_n - second_n;
        int32_t survivor_owner = (survivors > 0) ? top_pid : -1;

        if (survivors > 0) {
            if (planet->owner == survivor_owner) {
                planet->ships += survivors;
            } else {
                planet->ships -= survivors;
                if (planet->ships < 0) {
                    planet->owner = survivor_owner;
                    planet->ships = -planet->ships;
                }
            }
        }
    }

    // 6. Advance step counter (mirrors core.py: after interpreter()).
    state.step += 1;

    // Terminal check: <=1 player has any ownership (planets or fleets) OR
    // we've hit the episode horizon (the engine ends the game at
    // step >= episodeSteps - 2 too).
    std::array<bool, MAX_PLAYERS> alive{};
    alive.fill(false);
    for (const auto& p : state.planets) {
        if (p.owner >= 0 && p.owner < MAX_PLAYERS) alive[p.owner] = true;
    }
    for (const auto& f : state.fleets) {
        if (f.owner >= 0 && f.owner < MAX_PLAYERS) alive[f.owner] = true;
    }
    int alive_count = 0;
    for (bool b : alive) if (b) ++alive_count;
    const bool terminal = (alive_count <= 1) || (state.step >= state.episode_steps - 1);

    return StepResult{terminal, total_arrivals};
}

}  // namespace ow
