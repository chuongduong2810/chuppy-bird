import * as THREE from 'three';
import {
  GRAVITY, FLAP_VELOCITY, LOGICAL_HEIGHT, GROUND_HEIGHT, BIRD_WIDTH, BIRD_HEIGHT,
} from './constants';

export interface Bird {
  mesh: THREE.Mesh;
  update(dt: number): void;
  flap(): void;
  reset(): void;
  readonly isDead: boolean;
  readonly vy: number;
}

export function createBird(scene: THREE.Scene): Bird {
  const geometry = new THREE.BoxGeometry(BIRD_WIDTH, BIRD_HEIGHT, 10);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFC300 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 1);
  scene.add(mesh);

  const startY = 0;
  let vy = 0;
  let isDead = false;
  let idleTime = 0;

  const HALF_H = LOGICAL_HEIGHT / 2;
  const groundY = -HALF_H + GROUND_HEIGHT + BIRD_HEIGHT / 2;
  const topY = HALF_H - BIRD_HEIGHT / 2;

  function update(dt: number): void {
    if (isDead) return;

    vy += GRAVITY * dt;
    mesh.position.y += vy * dt;

    const targetRot = vy > 0
      ? -Math.PI / 6   // nose up: -30 degrees
      : Math.PI / 2;   // nose down: +90 degrees
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetRot, 8 * dt);

    if (mesh.position.y <= groundY) {
      mesh.position.y = groundY;
      vy = 0;
      isDead = true;
    }

    if (mesh.position.y >= topY) {
      mesh.position.y = topY;
      vy = 0;
    }
  }

  function updateIdle(dt: number): void {
    idleTime += dt;
    mesh.position.y = startY + Math.sin(idleTime * 2) * 8;
    mesh.rotation.z = Math.sin(idleTime * 2) * 0.15;
  }

  function flap(): void {
    vy = FLAP_VELOCITY;
    mesh.rotation.z = -Math.PI / 6;
  }

  function reset(): void {
    mesh.position.set(0, startY, 1);
    mesh.rotation.z = 0;
    vy = 0;
    isDead = false;
    idleTime = 0;
  }

  (mesh as any).__idleUpdate = updateIdle;

  return {
    mesh,
    get isDead() { return isDead; },
    get vy() { return vy; },
    update,
    flap,
    reset,
  };
}
