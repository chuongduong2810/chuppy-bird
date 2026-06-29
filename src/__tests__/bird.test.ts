import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FLAP_VELOCITY, LOGICAL_HEIGHT, GROUND_HEIGHT, BIRD_HEIGHT } from '../constants';

// Minimal mock for THREE so tests run in Node without WebGL
vi.mock('three', () => {
  class Vector3 {
    x = 0; y = 0; z = 0;
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
  }
  class Euler {
    x = 0; y = 0; z = 0;
  }
  class MeshBasicMaterial {}
  class BoxGeometry {}
  class Mesh {
    position = new Vector3();
    rotation = new Euler();
    add() {}
  }
  class Scene {
    add() {}
  }
  const MathUtils = {
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  };
  return { BoxGeometry, MeshBasicMaterial, Mesh, Scene, MathUtils };
});

// Import AFTER mock is set up
const { createBird } = await import('../bird');

describe('Bird physics', () => {
  let scene: any;
  let bird: any;

  beforeEach(async () => {
    const THREE = await import('three');
    scene = new THREE.Scene();
    bird = createBird(scene);
  });

  it('applies gravity each tick', () => {
    const initialY = bird.mesh.position.y;
    bird.update(1 / 60);
    expect(bird.mesh.position.y).toBeLessThan(initialY);
  });

  it('sets vy to FLAP_VELOCITY on flap', () => {
    bird.flap();
    expect(bird.vy).toBe(FLAP_VELOCITY);
  });

  it('bird moves upward immediately after flap', () => {
    bird.flap();
    const yBefore = bird.mesh.position.y;
    bird.update(1 / 60);
    expect(bird.mesh.position.y).toBeGreaterThan(yBefore);
  });

  it('clamps at ground and sets isDead', () => {
    // Drop bird well below ground
    bird.mesh.position.y = -9999;
    bird.update(1 / 60);
    const groundY = -LOGICAL_HEIGHT / 2 + GROUND_HEIGHT + BIRD_HEIGHT / 2;
    expect(bird.mesh.position.y).toBeCloseTo(groundY, 0);
    expect(bird.isDead).toBe(true);
  });

  it('reset restores default state', () => {
    bird.flap();
    bird.update(1 / 60);
    bird.reset();
    expect(bird.isDead).toBe(false);
    expect(bird.vy).toBe(0);
    expect(bird.mesh.position.y).toBe(0);
  });
});
