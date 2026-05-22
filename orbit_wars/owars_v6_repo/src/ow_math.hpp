// ow_math.hpp -- Geometric primitives shared by the simulator and the
// intercept solver. Header-only, inlined in hot loops.
//
// All formulas are byte-for-byte equivalent to
// kaggle_environments/envs/orbit_wars/orbit_wars.py lines 30-65 and
// 575-586.

#pragma once

#include <cmath>

#include "ow_constants.hpp"

namespace ow {

inline double sqr(double v) { return v * v; }

inline double hypot2(double dx, double dy) {
    return std::sqrt(dx * dx + dy * dy);
}

// log(1000.0) precomputed -- the reference uses math.log(1000), i.e. natural
// log, NOT log10. We use the exact same call so the cube-root sweetspot
// formula stays bit-identical.
inline const double LOG_1000 = std::log(1000.0);

// Speed of a fleet of `ships` ships, in board-units per tick.
// Bit-exact mirror of the Python reference:
//   speed = 1 + (max_speed - 1) * (log(ships)/log(1000))**1.5
//   speed = min(speed, max_speed)
inline double fleet_speed(int ships, double max_speed = DEFAULT_SHIP_SPEED) {
    if (ships <= 0) return 0.0;
    if (ships == 1) return 1.0;
    const double r = std::log(static_cast<double>(ships)) / LOG_1000;
    double s = 1.0 + (max_speed - 1.0) * std::pow(r, 1.5);
    return s > max_speed ? max_speed : s;
}

// Distance from point P=(px,py) to segment V--W. Mirrors
// reference point_to_segment_distance with l2==0 fallback to direct
// distance.
inline double point_to_segment_distance(
    double px, double py,
    double vx, double vy,
    double wx, double wy) {
    const double dx = wx - vx;
    const double dy = wy - vy;
    const double l2 = dx * dx + dy * dy;
    if (l2 == 0.0) {
        return hypot2(px - vx, py - vy);
    }
    double t = ((px - vx) * dx + (py - vy) * dy) / l2;
    if (t < 0.0) t = 0.0;
    if (t > 1.0) t = 1.0;
    const double projx = vx + t * dx;
    const double projy = vy + t * dy;
    return hypot2(px - projx, py - projy);
}

// True iff a fleet moving A->B and a planet moving P0->P1 come within `r`
// of each other for some t in [0, 1]. Both are linearised over the tick.
//
// Mirrors reference swept_pair_hit verbatim; this is critical for combat
// resolution to be physically correct.
inline bool swept_pair_hit(
    double ax, double ay,
    double bx, double by,
    double p0x, double p0y,
    double p1x, double p1y,
    double r) {
    const double d0x = ax - p0x;
    const double d0y = ay - p0y;
    const double dvx = (bx - ax) - (p1x - p0x);
    const double dvy = (by - ay) - (p1y - p0y);
    const double a = dvx * dvx + dvy * dvy;
    const double b = 2.0 * (d0x * dvx + d0y * dvy);
    const double c = d0x * d0x + d0y * d0y - r * r;
    if (a < 1e-12) {
        return c <= 0.0;
    }
    const double disc = b * b - 4.0 * a * c;
    if (disc < 0.0) return false;
    const double sq = std::sqrt(disc);
    const double t1 = (-b - sq) / (2.0 * a);
    const double t2 = (-b + sq) / (2.0 * a);
    return t2 >= 0.0 && t1 <= 1.0;
}

// Returns true if the line segment (lx,ly)->(tx,ty) passes within
// SUN_RADIUS of the sun (CENTER, CENTER). A small slack of 1e-9 keeps
// us strictly on the safe side (the reference uses "<" so we mirror it).
inline bool segment_hits_sun(double lx, double ly, double tx, double ty) {
    return point_to_segment_distance(CENTER, CENTER, lx, ly, tx, ty)
           < SUN_RADIUS;
}

// Position of a (potentially rotating) planet at absolute step `step`,
// given its initial (step=0) position. Mirrors reference physics:
//   if r + planet_radius < ROTATION_RADIUS_LIMIT: rotates with angular_velocity
//   else: static.
inline void planet_position_at(
    double initial_x, double initial_y, double planet_radius,
    double angular_velocity, int step,
    double& out_x, double& out_y) {
    const double dx = initial_x - CENTER;
    const double dy = initial_y - CENTER;
    const double r = std::sqrt(dx * dx + dy * dy);
    if (r + planet_radius < ROTATION_RADIUS_LIMIT) {
        const double initial_angle = std::atan2(dy, dx);
        const double current_angle = initial_angle + angular_velocity * step;
        out_x = CENTER + r * std::cos(current_angle);
        out_y = CENTER + r * std::sin(current_angle);
    } else {
        out_x = initial_x;
        out_y = initial_y;
    }
}

}  // namespace ow
