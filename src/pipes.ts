import * as THREE from 'three';
import {
  LOGICAL_HEIGHT, LOGICAL_WIDTH, GROUND_HEIGHT,
  PIPE_GAP, PIPE_WIDTH, SCROLL_SPEED,
  BIRD_WIDTH, BIRD_HEIGHT,
} from './constants';

export interface PipePair {
  topMesh: THREE.Mesh;
  bottomMesh: THREE.Mesh;
  x: number;
  gapCenterY: number;
  passed: boolean;
}

export interface PipeManager {
  pairs: PipePair[];
  collision: boolean;
  update(dt: number, birdMesh: THREE.Mesh, speedMultiplier?: number): void;
  reset(): void;
}

const PIPE_COLOR = 0x73BF2E;
const HALF_H = LOGICAL_HEIGHT / 2;
const SPAWN_X = LOGICAL_WIDTH / 2 + PIPE_WIDTH;     // spawn just off right edge
const DESPAWN_X = -LOGICAL_WIDTH / 2 - PIPE_WIDTH;  // despawn just off left edge
const SPAWN_INTERVAL = 230;   // world units between pipe pairs (horizontal spacing)

function makePipeMesh(height: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(PIPE_WIDTH, height, 10);
  const mat = new THREE.MeshBasicMaterial({ color: PIPE_COLOR });
  return new THREE.Mesh(geo, mat);
}

function randomGapCenterY(): number {
  // Gap centre must be within [20%, 80%] of play area height
  const minY = -HALF_H + GROUND_HEIGHT + PIPE_GAP / 2 + 20;
  const maxY = HALF_H - PIPE_GAP / 2 - 20;
  return minY + Math.random() * (maxY - minY);
}

function spawnPair(scene: THREE.Scene, x: number): PipePair {
  const gapCenterY = randomGapCenterY();

  // Top pipe: from top edge down to gap top
  const topBottom = gapCenterY + PIPE_GAP / 2;
  const topHeight = HALF_H - topBottom;
  const topMesh = makePipeMesh(topHeight);
  topMesh.position.set(x, HALF_H - topHeight / 2, 0);

  // Bottom pipe: from gap bottom down to ground top
  const bottomTop = gapCenterY - PIPE_GAP / 2;
  const bottomHeight = bottomTop - (-HALF_H + GROUND_HEIGHT);
  const bottomMesh = makePipeMesh(bottomHeight);
  bottomMesh.position.set(x, -HALF_H + GROUND_HEIGHT + bottomHeight / 2, 0);

  scene.add(topMesh, bottomMesh);

  return { topMesh, bottomMesh, x, gapCenterY, passed: false };
}

function aabbCollides(birdMesh: THREE.Mesh, pipeMesh: THREE.Mesh, pipeHeight: number): boolean {
  const bx = birdMesh.position.x;
  const by = birdMesh.position.y;
  const bHalfW = BIRD_WIDTH / 2 - 2;   // 2px inset for forgiveness
  const bHalfH = BIRD_HEIGHT / 2 - 2;

  const px = pipeMesh.position.x;
  const py = pipeMesh.position.y;
  const pHalfW = PIPE_WIDTH / 2;
  const pHalfH = pipeHeight / 2;

  return (
    Math.abs(bx - px) < bHalfW + pHalfW &&
    Math.abs(by - py) < bHalfH + pHalfH
  );
}

export function createPipeManager(scene: THREE.Scene): PipeManager {
  const pairs: PipePair[] = [];
  let collision = false;
  let distanceSinceLastSpawn = 0;

  // Spawn initial pair slightly ahead
  pairs.push(spawnPair(scene, SPAWN_X * 0.8));

  function update(dt: number, birdMesh: THREE.Mesh, speedMultiplier = 1): void {
    if (collision) return;

    const speed = SCROLL_SPEED * speedMultiplier;
    distanceSinceLastSpawn += speed * dt;

    // Spawn new pair when needed
    if (distanceSinceLastSpawn >= SPAWN_INTERVAL) {
      pairs.push(spawnPair(scene, SPAWN_X));
      distanceSinceLastSpawn = 0;
    }

    // Move all pairs left and check collision
    for (const pair of pairs) {
      pair.x -= speed * dt;
      pair.topMesh.position.x = pair.x;
      pair.bottomMesh.position.x = pair.x;

      // Get pipe heights from geometry bounding box
      pair.topMesh.geometry.computeBoundingBox();
      pair.bottomMesh.geometry.computeBoundingBox();
      const topBox = pair.topMesh.geometry.boundingBox!;
      const botBox = pair.bottomMesh.geometry.boundingBox!;
      const topH = topBox.max.y - topBox.min.y;
      const botH = botBox.max.y - botBox.min.y;

      if (aabbCollides(birdMesh, pair.topMesh, topH) || aabbCollides(birdMesh, pair.bottomMesh, botH)) {
        collision = true;
        return;
      }
    }

    // Despawn pairs that have scrolled off screen
    for (let i = pairs.length - 1; i >= 0; i--) {
      if (pairs[i].x < DESPAWN_X) {
        scene.remove(pairs[i].topMesh, pairs[i].bottomMesh);
        pairs[i].topMesh.geometry.dispose();
        pairs[i].bottomMesh.geometry.dispose();
        pairs.splice(i, 1);
      }
    }
  }

  function reset(): void {
    for (const pair of pairs) {
      scene.remove(pair.topMesh, pair.bottomMesh);
      pair.topMesh.geometry.dispose();
      pair.bottomMesh.geometry.dispose();
    }
    pairs.length = 0;
    collision = false;
    distanceSinceLastSpawn = 0;
    pairs.push(spawnPair(scene, SPAWN_X * 0.8));
  }

  return {
    get pairs() { return pairs; },
    get collision() { return collision; },
    update,
    reset,
  };
}
