# ADR 0001 — Three.js with Orthographic Camera

**Status:** Accepted  
**Date:** 2026-06-29

## Context

The game is a Flappy Bird clone — a 2D side-scrolling game. The requirement specifies Three.js for all animation and interaction. We must decide how to project the 3D scene so it reads as a faithful 2D game.

## Decision

Use **Three.js `OrthographicCamera`** with world units mapped to a fixed logical width (e.g., 480 world units ≈ viewport width), scaled by `window.innerHeight / logicalHeight` on resize. This gives pixel-art-like stable sizes regardless of device resolution.

Meshes are flat-extruded `BoxGeometry` or `PlaneGeometry` objects with `MeshBasicMaterial` textured from sprite sheets, giving the Three.js render pipeline without any perspective distortion.

## Alternatives Considered

| Option | Why rejected |
|---|---|
| `PerspectiveCamera` | Produces 3D depth distortion — wrong feel for a 2D clone. |
| Canvas 2D API | Does not use Three.js; contradicts the requirement. |
| CSS/DOM animation | Same issue; no Three.js. |

## Consequences

- Resize handler must recompute `camera.left/right/top/bottom` and call `camera.updateProjectionMatrix()`.  
- z-ordering is managed by setting explicit `mesh.position.z` layers (background, pipes, bird, HUD).  
- No lighting needed — `MeshBasicMaterial` bypasses the light system entirely, keeping frame cost low.
