import { initScene } from './scene';
import { startLoop, resetAccumulator } from './gameLoop';
import { GameState, getState, setState } from './state';
import { createBird } from './bird';
import { createPipeManager } from './pipes';
import './style.css';

const { renderer, scene, camera } = initScene();
const bird = createBird(scene);
const pipeManager = createPipeManager(scene);

let scoreCount = 0;

function handleFlap(): void {
  const state = getState();
  if (state === GameState.Idle) {
    setState(GameState.Playing);
    bird.reset();
    pipeManager.reset();
    scoreCount = 0;
    bird.flap();
    resetAccumulator();
  } else if (state === GameState.Playing) {
    bird.flap();
  } else if (state === GameState.Dead) {
    setState(GameState.Idle);
    bird.reset();
    pipeManager.reset();
    scoreCount = 0;
    resetAccumulator();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleFlap();
  }
});

window.addEventListener('pointerdown', () => {
  handleFlap();
});

startLoop(
  (dt: number) => {
    const state = getState();
    if (state === GameState.Idle) {
      (bird.mesh as any).__idleUpdate?.(dt);
    } else if (state === GameState.Playing) {
      const speedMult = 1 + scoreCount * 0.02;
      bird.update(dt);
      pipeManager.update(dt, bird.mesh, speedMult);

      // Score: count passed pairs
      for (const pair of pipeManager.pairs) {
        if (!pair.passed && bird.mesh.position.x > pair.x) {
          pair.passed = true;
          scoreCount++;
        }
      }

      if (bird.isDead || pipeManager.collision) {
        setState(GameState.Dead);
      }
    }
  },
  () => {
    renderer.render(scene, camera);
  }
);
