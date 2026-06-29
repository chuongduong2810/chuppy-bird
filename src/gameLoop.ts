import { FIXED_DT } from './constants';

let rafId = 0;
let lastTime = 0;
let accumulator = 0;

export function startLoop(
  onTick: (dt: number) => void,
  onRender: () => void
): void {
  lastTime = performance.now();
  accumulator = 0;

  function frame(now: number) {
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    accumulator += delta;
    while (accumulator >= FIXED_DT) {
      onTick(FIXED_DT);
      accumulator -= FIXED_DT;
    }
    onRender();
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
}

export function stopLoop(): void {
  cancelAnimationFrame(rafId);
  rafId = 0;
}

export function resetAccumulator(): void {
  accumulator = 0;
  lastTime = performance.now();
}
