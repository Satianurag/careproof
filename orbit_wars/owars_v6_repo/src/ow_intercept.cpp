// ow_intercept.cpp -- See header.

#include "ow_intercept.hpp"

#include <cmath>

#include "ow_math.hpp"

namespace ow {

std::optional<InterceptSolution> solve_intercept(
    double launch_x, double launch_y,
    int launch_step,
    int ships,
    const TargetTrajectory& target_fn,
    double target_radius,
    int max_dt,
    double max_speed,
    bool avoid_sun) {
    if (ships <= 0) return std::nullopt;
    const double speed = fleet_speed(ships, max_speed);

    for (int dt = 1; dt <= max_dt; ++dt) {
        const auto [tx, ty] = target_fn(launch_step + dt);
        const double dx = tx - launch_x;
        const double dy = ty - launch_y;
        const double dist = std::sqrt(dx * dx + dy * dy);
        if (speed * dt + target_radius >= dist) {
            const double angle = std::atan2(dy, dx);
            if (avoid_sun && segment_hits_sun(launch_x, launch_y, tx, ty)) {
                continue;
            }
            return InterceptSolution{angle, dt, tx, ty};
        }
    }
    return std::nullopt;
}

}  // namespace ow
