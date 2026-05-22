// ow_intercept.hpp -- Closed-form fleet-intercept solver.
//
// Given a launching planet's position at launch_step, a fleet size, and a
// target's trajectory function (lambda mapping absolute step -> position),
// finds the smallest dt in [1, max_dt] such that the fleet, travelling at
// fleet_speed(ships) in a straight line, can hit a point within
// target_radius of the target on or before step (launch_step + dt). The
// solution respects sun avoidance (line of sight must clear SUN_RADIUS).

#pragma once

#include <functional>
#include <optional>
#include <utility>

#include "ow_constants.hpp"

namespace ow {

struct InterceptSolution {
    double angle;
    int dt;
    double target_x;
    double target_y;
};

using TargetTrajectory = std::function<std::pair<double, double>(int abs_step)>;

// Returns the *earliest* feasible intercept, or std::nullopt if no solution
// in [1, max_dt] works.
//
// avoid_sun=true rejects any candidate whose launch-to-target line segment
// passes within SUN_RADIUS of the center.
std::optional<InterceptSolution> solve_intercept(
    double launch_x, double launch_y,
    int launch_step,
    int ships,
    const TargetTrajectory& target_fn,
    double target_radius,
    int max_dt = 60,
    double max_speed = DEFAULT_SHIP_SPEED,
    bool avoid_sun = true);

}  // namespace ow
