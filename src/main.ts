import { initScene } from './scene';
import { startLoop } from './gameLoop';
import { GameState, getState } from './state';
import './style.css';

const { renderer, scene, camera } = initScene();

startLoop(
  (_dt: number) => {
    // Physics tick — populated by later slices
    void _dt;
    void getState;
    void GameState;
  },
  () => {
    renderer.render(scene, camera);
  }
);
