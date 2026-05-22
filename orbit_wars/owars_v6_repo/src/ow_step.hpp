// ow_step.hpp -- One-tick forward simulator used by the beam search.
//
// Semantics mirror kaggle_environments/envs/orbit_wars/orbit_wars.py
// interpreter() exactly for: fleet launch, production, planet path
// derivation, fleet movement with swept-pair collision, planet movement,
// combat resolution. New comet spawns at steps {50,150,250,350,450} are
// NOT modelled inside the search (we cannot reproduce the engine's hidden
// seed); existing comets continue along their known paths.

#pragma once

#include <vector>

#include "ow_types.hpp"

namespace ow {

struct StepResult {
    // True iff at most one player still has any owned planets or fleets.
    bool terminal_single_winner;
    // Number of fleets that arrived at a planet this tick (used for
    // eval awareness of forced combat).
    int32_t arrivals;
};

// Advance the world by exactly one tick.
//
// `actions[i]` are the moves submitted by player i this turn. Players for
// which no element is present in `actions` are treated as having no moves.
// `state` is mutated in place. The step counter inside `state` is
// incremented AFTER physics resolves, mirroring core.py's "step =
// len(self.steps)" assignment that runs after interpreter().
StepResult step(Observation& state, const std::vector<std::vector<Move>>& actions);

}  // namespace ow
