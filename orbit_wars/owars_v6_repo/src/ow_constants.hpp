// ow_constants.hpp -- Orbit Wars physics constants.
//
// All values mirror kaggle_environments/envs/orbit_wars/orbit_wars.py
// (lines 16-27) and orbit_wars.json. Single source of truth here.

#pragma once

namespace ow {

inline constexpr double BOARD_SIZE = 100.0;
inline constexpr double CENTER = BOARD_SIZE / 2.0;
inline constexpr double SUN_RADIUS = 10.0;
inline constexpr double ROTATION_RADIUS_LIMIT = 50.0;
inline constexpr double COMET_RADIUS = 1.0;
inline constexpr int COMET_PRODUCTION = 1;
inline constexpr int COMET_SPAWN_STEPS[] = {50, 150, 250, 350, 450};

inline constexpr double DEFAULT_SHIP_SPEED = 6.0;
inline constexpr double DEFAULT_COMET_SPEED = 4.0;
inline constexpr int DEFAULT_EPISODE_STEPS = 500;
inline constexpr double DEFAULT_ACT_TIMEOUT_S = 1.0;
inline constexpr double DEFAULT_OVERAGE_BUDGET_S = 60.0;

inline constexpr int MAX_PLAYERS = 4;

}  // namespace ow
