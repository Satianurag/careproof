// ow_types.hpp -- Core data structures shared across modules.
//
// Layout is chosen for cache-friendliness in the hot loops (PlanetTimeline,
// fleet movement) and for cheap copying inside the beam-search frontier.

#pragma once

#include <array>
#include <cstdint>
#include <vector>

#include "ow_constants.hpp"

namespace ow {

struct Planet {
    int32_t id;
    int32_t owner;       // -1 = neutral, 0..3 = player
    double x;
    double y;
    double radius;
    int32_t ships;
    int32_t production;  // 0 means inert (comet that already expired); >=1 means producing
    bool is_comet;       // true if this entry is a comet-shaped temporary planet
};

struct Fleet {
    int32_t id;
    int32_t owner;
    double x;
    double y;
    double angle;
    int32_t from_planet_id;
    int32_t ships;
};

// Comet group: shares a list of planet ids that all move along their own
// "paths" array in lock-step (one path per planet in the group, indexed by
// the shared path_index).
struct CometGroup {
    std::vector<int32_t> planet_ids;
    // paths[i] = sequence of (x, y) waypoints for the i-th comet in this
    // group. Comet i's position at step k after spawn is paths[i][k].
    std::vector<std::vector<std::array<double, 2>>> paths;
    int32_t path_index;  // -1 before first advance; >= 0 once moving
};

struct Move {
    int32_t from_planet_id;
    double angle;
    int32_t ships;
};

// Per-turn observation passed to ow_decide().
//
// `step` MUST be filled in by the caller (Python shim) before calling --
// when the Kaggle observation has obs.step == None for non-zero players,
// the shim is responsible for substituting an internally tracked counter.
struct Observation {
    int32_t pid;
    int32_t num_agents;
    int32_t step;
    double angular_velocity;
    int32_t next_fleet_id;
    double ship_speed;
    double comet_speed;
    int32_t episode_steps;
    double remaining_overage_s;  // remainingOverageTime in seconds
    std::vector<Planet> planets;
    std::vector<Planet> initial_planets;
    std::vector<Fleet> fleets;
    std::vector<CometGroup> comets;
};

}  // namespace ow
