// ow_timeline.cpp -- See header.

#include "ow_timeline.hpp"

#include "ow_step.hpp"

namespace ow {

Forecast build_forecast(const Observation& state, int horizon) {
    Forecast f;
    f.ticks.reserve(horizon + 1);

    Observation sim = state;
    const std::vector<std::vector<Move>> no_moves(sim.num_agents);

    for (int t = 0; t <= horizon; ++t) {
        std::unordered_map<int32_t, PlanetSnapshot> snap;
        snap.reserve(sim.planets.size() * 2);
        for (const auto& p : sim.planets) {
            snap[p.id] = PlanetSnapshot{p.owner, p.ships, p.x, p.y, true};
        }
        f.ticks.push_back(std::move(snap));
        if (t == horizon) break;

        const auto r = step(sim, no_moves);
        if (r.terminal_single_winner) {
            // Pad remaining ticks with the final snapshot so callers can
            // safely index up to horizon.
            std::unordered_map<int32_t, PlanetSnapshot> last;
            last.reserve(sim.planets.size() * 2);
            for (const auto& p : sim.planets) {
                last[p.id] = PlanetSnapshot{p.owner, p.ships, p.x, p.y, true};
            }
            for (int u = t + 1; u <= horizon; ++u) {
                f.ticks.push_back(last);
            }
            break;
        }
    }
    return f;
}

const PlanetSnapshot* lookup(const Forecast& f, int32_t planet_id, int rel_tick) {
    if (rel_tick < 0 || rel_tick >= static_cast<int>(f.ticks.size())) return nullptr;
    const auto& tick = f.ticks[rel_tick];
    const auto it = tick.find(planet_id);
    if (it == tick.end()) return nullptr;
    return &it->second;
}

}  // namespace ow
