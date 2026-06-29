import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('three', () => {
  class BufferGeometry {
    attributes: Record<string, unknown> = {};
    boundingBox: { min: { y: number }; max: { y: number } } | null = null;
    computeBoundingBox() {
      this.boundingBox = { min: { y: -(this as any)._h / 2 }, max: { y: (this as any)._h / 2 } };
    }
    dispose() {}
  }
  class BoxGeometry extends BufferGeometry {
    constructor(_w: number, h: number, _d: number) {
      super();
      (this as any)._h = h;
      this.boundingBox = { min: { y: -h / 2 }, max: { y: h / 2 } };
    }
  }
  class MeshBasicMaterial { dispose() {} }
  class Mesh {
    position = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } };
    rotation = { z: 0 };
    geometry: BoxGeometry;
    constructor(geo: BoxGeometry) { this.geometry = geo; }
  }
  class Scene {
    objects: Mesh[] = [];
    add(...items: Mesh[]) { this.objects.push(...items); }
    remove(...items: Mesh[]) { items.forEach(i => { const idx = this.objects.indexOf(i); if (idx >= 0) this.objects.splice(idx, 1); }); }
  }
  const MathUtils = { lerp: (a: number, b: number, t: number) => a + (b - a) * t };
  return { BoxGeometry, MeshBasicMaterial, Mesh, Scene, MathUtils };
});

const { createPipeManager } = await import('../pipes');

describe('PipeManager', () => {
  let scene: any;
  let manager: any;

  beforeEach(async () => {
    const THREE = await import('three');
    scene = new THREE.Scene();
    manager = createPipeManager(scene);
  });

  it('spawns an initial pipe pair', () => {
    expect(manager.pairs.length).toBeGreaterThanOrEqual(1);
  });

  it('moves pipes left on update', () => {
    const initialX = manager.pairs[0].x;
    const fakeBird = { position: { x: -9999, y: 0 } };
    manager.update(1 / 60, fakeBird);
    expect(manager.pairs[0].x).toBeLessThan(initialX);
  });

  it('detects no collision when bird is far left', () => {
    const fakeBird = { position: { x: -9999, y: 0 } };
    manager.update(1 / 60, fakeBird);
    expect(manager.collision).toBe(false);
  });

  it('resets to clean state', () => {
    const fakeBird = { position: { x: -9999, y: 0 } };
    manager.update(1 / 60, fakeBird);
    manager.reset();
    expect(manager.collision).toBe(false);
    expect(manager.pairs.length).toBeGreaterThanOrEqual(1);
  });
});
