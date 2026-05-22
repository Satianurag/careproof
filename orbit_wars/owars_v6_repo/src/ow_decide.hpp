// ow_decide.hpp -- Top-level bot entrypoint.
//
// Given a fully-marshalled observation, returns the list of moves to
// submit this tick. Thread-unsafe (uses internal scratch buffers); only
// one ow_decide call should ever be in-flight at a time.

#pragma once

#include <chrono>
#include <cstdint>
#include <vector>

#include "ow_types.hpp"

namespace ow {

std::vector<Move> decide(const Observation& state, double time_budget_ms);

}  // namespace ow
