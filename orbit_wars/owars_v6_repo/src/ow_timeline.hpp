// ow_timeline.hpp -- Baseline per-planet forecast used by candidate
// generation.
//
// Given a starting state, runs the lite simulator forward H ticks with NO
// new moves from anybody, and snapshots each planet's (owner, ships, x, y)
// at each tick. Comet positions and expirations are tracked so the bot
// won't waste ships chasing an already-expired comet.

#pragma once

#include <cstdint>
#include <unordered_map>
#include <vector>

#include "ow_types.hpp"

namespace ow {

struct PlanetSnapshot {
    int32_t owner;
    int32_t ships;
    double x;
    double y;
    bool alive;  // false if planet/comet has expired by this tick
};

// Forecast over H+1 ticks: ticks[0] is the state AS PASSED IN (after this
// agent's moves are already applied, before stepping), ticks[1] is after
// one step() call, etc.
struct Forecast {
    // forecast[t][pid] -> snapshot. We use a vector of maps because
    // planet ids are sparse-ish but not dense.
    std::vector<std::unordered_map<int32_t, PlanetSnapshot>> ticks;
};

// Build the baseline forecast over `horizon` future ticks. `state` is
// copied internally; the caller's state is not modified.
Forecast build_forecast(const Observation& state, int horizon);

// Convenience: look up a planet's projected garrison at absolute step
// `abs_step` from a baseline forecast. Returns nullopt if the planet
// is dead by that step or the step is out of range.
struct GarrisonAt {
    int32_t owner;
    int32_t ships;
};
const PlanetSnapshot* lookup(const Forecast& f, int32_t planet_id, int rel_tick);

}  // namespace ow
