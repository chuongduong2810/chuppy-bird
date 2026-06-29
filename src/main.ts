import { initScene } from './scene';
import { startLoop, resetAccumulator } from './gameLoop';
import { GameState, getState, setState } from './state';
import { createBird } from './bird';
import './style.css';

const { renderer, scene, camera } = initScene();
const bird = createBird(scene);

function handleFlap(): void {
  const state = getState();
  if (state === GameState.Idle) {
    setState(GameState.Playing);
    bird.reset();
    bird.flap();
    resetAccumulator();
  } else if (state === GameState.Playing) {
    bird.flap();
  } else if (state === GameState.Dead) {
    setState(GameState.Idle);
    bird.reset();
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
      bird.update(dt);
      if (bird.isDead) {
        setState(GameState.Dead);
      }
    }
  },
  () => {
    renderer.render(scene, camera);
  }
);
