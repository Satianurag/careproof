"""Orbit Wars v5 -- Kaggle entrypoint.

Loads the compiled decision engine and forwards each observation in one
ctypes call. All strategy lives in `liboworbit.so`.
"""

from __future__ import annotations

import ctypes
import os
import sys


def _find_lib() -> str:
    if "__file__" in globals():
        here = os.path.dirname(os.path.abspath(__file__))
    else:
        for cand in (*sys.path, os.getcwd()):
            if cand and os.path.exists(os.path.join(cand, "liboworbit.so")):
                here = cand
                break
        else:
            here = os.getcwd()
    if here not in sys.path:
        sys.path.insert(0, here)
    return os.path.join(here, "liboworbit.so")


_LIB = ctypes.CDLL(_find_lib())

_LIB.ow_version.restype = ctypes.c_int
_LIB.ow_version.argtypes = []
assert _LIB.ow_version() == 5, "liboworbit.so ABI mismatch"

_DOUBLE_P = ctypes.POINTER(ctypes.c_double)
_INT_P = ctypes.POINTER(ctypes.c_int)

_LIB.ow_decide_c.restype = ctypes.c_int
_LIB.ow_decide_c.argtypes = [
    ctypes.c_int, ctypes.c_int, ctypes.c_int,
    ctypes.c_double, ctypes.c_int,
    ctypes.c_double, ctypes.c_double, ctypes.c_int,
    ctypes.c_double, ctypes.c_double,
    _DOUBLE_P, ctypes.c_int,
    _DOUBLE_P, ctypes.c_int,
    _DOUBLE_P, ctypes.c_int,
    _DOUBLE_P, ctypes.c_int,
    _DOUBLE_P, ctypes.c_int,
    _INT_P,
]

# Stable scratch buffers. Reused across calls to avoid Python allocator
# pressure on the 1s hot path.
_PBUF_CAP = 256
_IBUF_CAP = 256
_FBUF_CAP = 4096
_CBUF_CAP = 16384
_MBUF_CAP = 256

_PBUF = (ctypes.c_double * (_PBUF_CAP * 7))()
_IBUF = (ctypes.c_double * (_IBUF_CAP * 7))()
_FBUF = (ctypes.c_double * (_FBUF_CAP * 7))()
_CBUF = (ctypes.c_double * _CBUF_CAP)()
_MBUF = (ctypes.c_double * (_MBUF_CAP * 3))()
_MCOUNT = ctypes.c_int(0)

# Internal step counter -- used as a fallback when obs.step is None,
# which happens for non-pid-0 agents in some Kaggle environments.
_state = {"last_step": -1}


def _marshal_planets(rows, buf, cap):
    n = 0
    for row in rows or ():
        if n >= cap:
            break
        i = n * 7
        buf[i + 0] = float(row[0])
        buf[i + 1] = float(row[1])
        buf[i + 2] = float(row[2])
        buf[i + 3] = float(row[3])
        buf[i + 4] = float(row[4])
        buf[i + 5] = float(row[5])
        buf[i + 6] = float(row[6])
        n += 1
    return n


def _marshal_comets(groups, buf, cap):
    """Pack comets into flat doubles. See ow_capi.cpp for the schema."""
    i = 0
    if not groups:
        return 0
    if cap < 1:
        return 0
    buf[i] = float(len(groups))
    i += 1
    for g in groups:
        path_index = int(g["path_index"])
        planet_ids = g["planet_ids"]
        paths = g["paths"]
        n_p = len(planet_ids)
        if i + 2 > cap:
            return i
        buf[i] = float(path_index); i += 1
        buf[i] = float(n_p); i += 1
        for j in range(n_p):
            if i + 2 > cap:
                return i
            buf[i] = float(planet_ids[j]); i += 1
            path_j = paths[j]
            plen = len(path_j)
            buf[i] = float(plen); i += 1
            for k in range(plen):
                if i + 2 > cap:
                    return i
                x, y = path_j[k]
                buf[i] = float(x); i += 1
                buf[i] = float(y); i += 1
    return i


def _derive_num_agents(obs):
    """Infer 2 vs 4 player game from observation."""
    pid = int(obs.player)
    max_owner = pid
    for p in obs.planets or ():
        o = int(p[1])
        if o > max_owner:
            max_owner = o
    for f in obs.fleets or ():
        o = int(f[1])
        if o > max_owner:
            max_owner = o
    return 4 if max_owner >= 2 else 2


def _safe_step(obs):
    s = getattr(obs, "step", None)
    if s is None:
        _state["last_step"] += 1
        return _state["last_step"]
    s = int(s)
    _state["last_step"] = s
    return s


def agent(obs, config):
    pid = int(obs.player)
    num_agents = _derive_num_agents(obs)
    step = _safe_step(obs)
    angular_velocity = float(getattr(obs, "angular_velocity", 0.0))
    next_fleet_id = int(getattr(obs, "next_fleet_id", 0))
    ship_speed = float(getattr(config, "shipSpeed", 6.0))
    comet_speed = float(getattr(config, "cometSpeed", 4.0))
    episode_steps = int(getattr(config, "episodeSteps", 500))
    remaining_overage = float(getattr(obs, "remainingOverageTime", 0.0))

    # Time budget: actTimeout=1s. Reserve ~150ms for marshalling + Python
    # overhead + Kaggle's wall-clock slack. If we have overage available,
    # we can spend up to 1.6s/turn early; otherwise stick to ~0.85s.
    if remaining_overage > 10.0:
        budget_ms = 850.0
    elif remaining_overage > 1.0:
        budget_ms = 780.0
    else:
        budget_ms = 700.0

    np_pln = _marshal_planets(obs.planets, _PBUF, _PBUF_CAP)
    np_ini = _marshal_planets(obs.initial_planets, _IBUF, _IBUF_CAP)
    np_flt = _marshal_planets(obs.fleets, _FBUF, _FBUF_CAP)
    nc = _marshal_comets(obs.comets, _CBUF, _CBUF_CAP)

    rc = _LIB.ow_decide_c(
        pid, num_agents, step,
        angular_velocity, next_fleet_id,
        ship_speed, comet_speed, episode_steps,
        remaining_overage, budget_ms,
        _PBUF, np_pln,
        _IBUF, np_ini,
        _FBUF, np_flt,
        _CBUF, nc,
        _MBUF, _MBUF_CAP,
        ctypes.byref(_MCOUNT),
    )
    if rc != 0:
        return []

    out = []
    n = _MCOUNT.value
    for i in range(n):
        base = i * 3
        out.append([
            int(_MBUF[base + 0]),
            float(_MBUF[base + 1]),
            int(_MBUF[base + 2]),
        ])
    return out
