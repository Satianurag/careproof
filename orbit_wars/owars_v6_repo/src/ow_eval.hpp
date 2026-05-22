// ow_eval.hpp -- Phase-aware leaf evaluator.
//
// Returns a scalar utility from `pid`'s perspective. Higher = better.
// The single most important weighting is production, scaled by remaining
// episode steps: a planet producing 5/tick with 200 ticks left is worth
// 1000 future ships, dwarfing any one-shot tactical advantage.

#pragma once

#include "ow_types.hpp"

namespace ow {

double eval_state(const Observation& state, int32_t pid);

}  // namespace ow
