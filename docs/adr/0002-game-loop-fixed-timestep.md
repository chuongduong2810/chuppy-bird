# ADR 0002 — Fixed-Timestep Physics Loop

**Status:** Accepted  
**Date:** 2026-06-29

## Context

Flappy Bird's feel is critically dependent on gravity and flap-impulse being deterministic at all frame rates. A naive `requestAnimationFrame` loop with variable `delta` produces inconsistent feel across devices.

## Decision

Use a **fixed physics timestep of 1/60 s** with an accumulator. Each `requestAnimationFrame` callback computes elapsed real time, feeds it into the accumulator, and runs as many 1/60 s physics ticks as the accumulator allows. Rendering happens once per frame using the last computed state.

```
accumulator += clamp(delta, 0, 0.1)   // cap at 100 ms to avoid spiral of death
while (accumulator >= FIXED_DT) {
  physicsTick(FIXED_DT)
  accumulator -= FIXED_DT
}
render()
```

## Alternatives Considered

| Option | Why rejected |
|---|---|
| Variable delta physics | Feel differs per device; pipe speed drifts |
| `setInterval` at 60 Hz | Drifts vs vsync; can run faster than render |

## Consequences

- Game speed is frame-rate-independent (correct at 30, 60, 120 Hz monitors).  
- The accumulator must be reset when the game pauses (tab hidden, game-over) to avoid a burst of ticks on resume.
