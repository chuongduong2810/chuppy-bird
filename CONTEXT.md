# CONTEXT — Chuppy Bird

Glossary of canonical terms used throughout this codebase.

## Bird
The player-controlled character. Rendered as a 3D mesh. Affected by gravity at all times. A **Flap** event applies an upward velocity impulse. Falls when no flap occurs. Dies on pipe or ground collision.

## Flap
The core player action — a single tap (touch), click (mouse), or Space/ArrowUp keypress. Applies an immediate upward velocity impulse to the Bird. One input event = one flap; no hold-to-fly.

## Pipe Pair
A vertically-aligned pair of obstacles: one Pipe extending downward from the top edge, one Pipe extending upward from the bottom edge, with a fixed **Gap** between them. Generated continuously as the game scrolls.

## Gap
The vertical opening between the top and bottom Pipe of a Pipe Pair, through which the Bird must fly. Fixed width (same as original: ~150 px-equivalent in world units).

## Scroll Speed
Constant horizontal velocity at which Pipe Pairs move toward the Bird. Increases slightly over time to ramp up difficulty.

## Score
Number of Pipe Pairs the Bird has successfully passed through (centre x of Bird crosses centre x of Pipe Pair). Rendered as a HUD overlay.

## Best Score
Highest Score achieved in the current browser session. Persisted to `localStorage`.

## Game State
One of three exclusive modes:
- **Idle** — splash/ready screen; bird gently bobs; tap to start
- **Playing** — physics active, pipes spawning, score counting
- **Dead** — collision occurred; bird falls to ground; game-over screen shown; tap to restart

## Ground
A repeating flat plane at the bottom of the viewport. Kills the Bird on contact. Scrolls in sync with Pipe Pairs to reinforce motion illusion.

## Day/Night Cycle
Visual theme that alternates each game session (or after a fixed score threshold). Sky, ground, and pipe colours shift accordingly. No gameplay effect.

## Scene
The Three.js `WebGLRenderer` + `Scene` + orthographic `Camera` that renders the world. Uses an orthographic projection (fixed world units per viewport width) to match the 2D feel of the original.

## Physics Tick
A fixed-timestep update loop (60 Hz target) that integrates Bird velocity and position. Runs only during **Playing** state.
