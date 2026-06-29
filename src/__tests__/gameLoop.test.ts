import { describe, it, expect } from 'vitest';
import { FIXED_DT } from '../constants';

// Pure accumulator logic extracted for testing
function runAccumulator(deltaMs: number, initialAccumulator = 0) {
  const delta = Math.min(deltaMs / 1000, 0.1);
  let accumulator = initialAccumulator + delta;
  let ticks = 0;
  while (accumulator >= FIXED_DT) {
    ticks++;
    accumulator -= FIXED_DT;
  }
  return { ticks, remainingAccumulator: accumulator };
}

describe('game loop accumulator', () => {
  it('produces one tick for a normal 16ms frame', () => {
    const { ticks } = runAccumulator(16.67);
    expect(ticks).toBe(1);
  });

  it('produces two ticks for a double-length frame', () => {
    const { ticks } = runAccumulator(33.34);
    expect(ticks).toBe(2);
  });

  it('caps delta at 100ms to prevent spiral of death', () => {
    const { ticks } = runAccumulator(5000);
    expect(ticks).toBeLessThanOrEqual(7); // 100ms / (1/60) ≈ 6
  });

  it('carries over remainder into next frame', () => {
    const { remainingAccumulator } = runAccumulator(16.67);
    expect(remainingAccumulator).toBeGreaterThanOrEqual(0);
    expect(remainingAccumulator).toBeLessThan(FIXED_DT);
  });
});
