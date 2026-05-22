// ow_capi.cpp -- C ABI shim called from Python via ctypes.
//
// All scalars are float64 for simplicity (int values are cast). Comet
// groups are encoded into a single flat array of doubles using the
// schema documented inline below.

#include <algorithm>
#include <array>
#include <cstdint>
#include <cstring>
#include <vector>

#include "ow_constants.hpp"
#include "ow_decide.hpp"
#include "ow_types.hpp"

#if defined(_WIN32)
#define OW_EXPORT __declspec(dllexport)
#else
#define OW_EXPORT __attribute__((visibility("default")))
#endif

extern "C" {

OW_EXPORT int ow_version(void) { return 5; }

// ow_decide_c
//
// Inputs (all double-precision, even for integer-typed fields):
//   pdata        : planets, 7 doubles per row, n_planets rows
//                  layout per row: id, owner, x, y, radius, ships, production
//   idata        : initial_planets, same layout, n_initial rows
//   fdata        : fleets, 7 doubles per row, n_fleets rows
//                  layout: id, owner, x, y, angle, from_planet_id, ships
//   cdata        : flat comet encoding (see below), cdata_len doubles
//
// Comet encoding:
//   [n_groups,
//    group0: path_index, n_planets, planet_id_0, path_len_0,
//            x_{0,0}, y_{0,0}, x_{0,1}, y_{0,1}, ...,
//            planet_id_1, path_len_1, ...,
//    group1: ...]
//
// Outputs:
//   moves_out    : buffer for moves, 3 doubles per row (from_id, angle, ships)
//   moves_cap    : capacity of moves_out (in rows)
//   *moves_count : actual number of moves written
//
// Returns 0 on success, -1 on error (e.g. too many moves to fit).

OW_EXPORT int ow_decide_c(
    int pid,
    int num_agents,
    int step,
    double angular_velocity,
    int next_fleet_id,
    double ship_speed,
    double comet_speed,
    int episode_steps,
    double remaining_overage_s,
    double time_budget_ms,
    const double* pdata, int n_planets,
    const double* idata, int n_initial,
    const double* fdata, int n_fleets,
    const double* cdata, int cdata_len,
    double* moves_out, int moves_cap,
    int* moves_count) {
    if (moves_count == nullptr) return -1;
    *moves_count = 0;

    ow::Observation obs;
    obs.pid = pid;
    obs.num_agents = num_agents;
    obs.step = step;
    obs.angular_velocity = angular_velocity;
    obs.next_fleet_id = next_fleet_id;
    obs.ship_speed = ship_speed;
    obs.comet_speed = comet_speed;
    obs.episode_steps = episode_steps;
    obs.remaining_overage_s = remaining_overage_s;

    // Decode planets.
    obs.planets.reserve(n_planets);
    for (int i = 0; i < n_planets; ++i) {
        const double* row = pdata + i * 7;
        ow::Planet p;
        p.id = static_cast<int32_t>(row[0]);
        p.owner = static_cast<int32_t>(row[1]);
        p.x = row[2];
        p.y = row[3];
        p.radius = row[4];
        p.ships = static_cast<int32_t>(row[5]);
        p.production = static_cast<int32_t>(row[6]);
        // Heuristic: comets have radius == COMET_RADIUS exactly (1.0)
        // and production == 1 (COMET_PRODUCTION). Static planets have
        // radius >= 1 + log(1) = 1.0 too, but their production is set
        // by generate_planets so this heuristic is unreliable. We'll
        // override below using the comet_planet_ids in cdata.
        p.is_comet = false;
        obs.planets.push_back(p);
    }
    // Decode initial planets.
    obs.initial_planets.reserve(n_initial);
    for (int i = 0; i < n_initial; ++i) {
        const double* row = idata + i * 7;
        ow::Planet p;
        p.id = static_cast<int32_t>(row[0]);
        p.owner = static_cast<int32_t>(row[1]);
        p.x = row[2];
        p.y = row[3];
        p.radius = row[4];
        p.ships = static_cast<int32_t>(row[5]);
        p.production = static_cast<int32_t>(row[6]);
        p.is_comet = false;
        obs.initial_planets.push_back(p);
    }
    // Decode fleets.
    obs.fleets.reserve(n_fleets);
    for (int i = 0; i < n_fleets; ++i) {
        const double* row = fdata + i * 7;
        ow::Fleet f;
        f.id = static_cast<int32_t>(row[0]);
        f.owner = static_cast<int32_t>(row[1]);
        f.x = row[2];
        f.y = row[3];
        f.angle = row[4];
        f.from_planet_id = static_cast<int32_t>(row[5]);
        f.ships = static_cast<int32_t>(row[6]);
        obs.fleets.push_back(f);
    }
    // Decode comets.
    int ci = 0;
    if (cdata_len > 0 && cdata != nullptr) {
        const int n_groups = static_cast<int>(cdata[ci++]);
        obs.comets.reserve(n_groups);
        for (int g = 0; g < n_groups && ci < cdata_len; ++g) {
            ow::CometGroup grp;
            grp.path_index = static_cast<int32_t>(cdata[ci++]);
            const int n_p = static_cast<int>(cdata[ci++]);
            grp.planet_ids.reserve(n_p);
            grp.paths.reserve(n_p);
            for (int j = 0; j < n_p && ci < cdata_len; ++j) {
                const int32_t pid_j = static_cast<int32_t>(cdata[ci++]);
                const int path_len = static_cast<int>(cdata[ci++]);
                std::vector<std::array<double, 2>> path;
                path.reserve(path_len);
                for (int k = 0; k < path_len && ci + 1 < cdata_len; ++k) {
                    const double x = cdata[ci++];
                    const double y = cdata[ci++];
                    path.push_back({x, y});
                }
                grp.planet_ids.push_back(pid_j);
                grp.paths.push_back(std::move(path));
                // Tag the matching planet as a comet.
                for (auto& p : obs.planets) {
                    if (p.id == pid_j) { p.is_comet = true; break; }
                }
                for (auto& p : obs.initial_planets) {
                    if (p.id == pid_j) { p.is_comet = true; break; }
                }
            }
            obs.comets.push_back(std::move(grp));
        }
    }

    // Run decision.
    const auto moves = ow::decide(obs, time_budget_ms);
    if (static_cast<int>(moves.size()) > moves_cap) {
        // Truncate to fit; caller's buffer is too small. Report success
        // with as many as fit so the bot still does *something*.
    }
    const int n_out = std::min(static_cast<int>(moves.size()), moves_cap);
    for (int i = 0; i < n_out; ++i) {
        double* row = moves_out + i * 3;
        row[0] = static_cast<double>(moves[i].from_planet_id);
        row[1] = moves[i].angle;
        row[2] = static_cast<double>(moves[i].ships);
    }
    *moves_count = n_out;
    return 0;
}

}  // extern "C"
