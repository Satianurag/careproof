// ow_eval.cpp -- See header.

#include "ow_eval.hpp"

#include <array>
#include <cmath>

#include "ow_constants.hpp"

namespace ow {

namespace {

// Each owned planet's production yields ships every tick until episode end.
// Scoring with `remaining * production` makes the bot value production
// gains compounding-style, which heuristically matches optimal play.
constexpr double SHIP_WEIGHT = 1.0;
constexpr double PRODUCTION_FUTURE_WEIGHT = 1.0;
// Cap the production lookahead so very-long-game scenarios don't make the
// eval blow up beyond the search's ability to differentiate moves.
constexpr int MAX_PRODUCTION_HORIZON = 80;
// A tiny baseline weight on PLANET COUNT - useful for breaking ties when
// production is equal (more planets = more launch surface area).
constexpr double PLANET_COUNT_WEIGHT = 2.0;

}  // namespace

double eval_state(const Observation& state, int32_t pid) {
    std::array<double, MAX_PLAYERS> ship_total{};
    std::array<double, MAX_PLAYERS> prod_total{};
    std::array<double, MAX_PLAYERS> planet_count{};
    ship_total.fill(0.0);
    prod_total.fill(0.0);
    planet_count.fill(0.0);

    int remaining = state.episode_steps - state.step;
    if (remaining < 1) remaining = 1;
    if (remaining > MAX_PRODUCTION_HORIZON) remaining = MAX_PRODUCTION_HORIZON;

    for (const auto& p : state.planets) {
        if (p.owner < 0 || p.owner >= MAX_PLAYERS) continue;
        ship_total[p.owner] += p.ships;
        prod_total[p.owner] += p.production;
        planet_count[p.owner] += 1.0;
    }
    for (const auto& f : state.fleets) {
        if (f.owner < 0 || f.owner >= MAX_PLAYERS) continue;
        ship_total[f.owner] += f.ships;
    }

    // Sum opponents' utility and subtract.
    double own = SHIP_WEIGHT * ship_total[pid]
                 + PRODUCTION_FUTURE_WEIGHT * prod_total[pid] * remaining
                 + PLANET_COUNT_WEIGHT * planet_count[pid];
    double opp = 0.0;
    for (int32_t i = 0; i < MAX_PLAYERS; ++i) {
        if (i == pid) continue;
        opp += SHIP_WEIGHT * ship_total[i]
               + PRODUCTION_FUTURE_WEIGHT * prod_total[i] * remaining
               + PLANET_COUNT_WEIGHT * planet_count[i];
    }
    // In 4P split opponents' total so dominating one foe isn't equivalent
    // to dominating all of them.
    const int n_opp = state.num_agents - 1;
    if (n_opp > 1) opp /= n_opp;
    return own - opp;
}

}  // namespace ow
