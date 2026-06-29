import * as THREE from 'three';
import { LOGICAL_HEIGHT } from './constants';

export interface SceneObjects {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
}

export function initScene(): SceneObjects {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x70C5CE);
  document.getElementById('app')!.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const aspect = window.innerWidth / window.innerHeight;
  const halfH = LOGICAL_HEIGHT / 2;
  const halfW = halfH * aspect;
  const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 1000);
  camera.position.z = 10;

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    const a = w / h;
    const hH = LOGICAL_HEIGHT / 2;
    camera.left = -hH * a;
    camera.right = hH * a;
    camera.top = hH;
    camera.bottom = -hH;
    camera.updateProjectionMatrix();
  }
  onResize();
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera };
}
