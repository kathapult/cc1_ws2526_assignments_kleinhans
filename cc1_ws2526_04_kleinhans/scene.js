import * as THREE from "three";
import { createNoise2D } from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
const gui = new GUI();
import { AmbientLight } from 'three';

// ============================================
// 1. SCENE
// ============================================
const scene = new THREE.Scene();
const branchGeometry = new THREE.CylinderGeometry(1, 1, 1, 6);

// ============================================
// 2. CAMERA
// ============================================
const fov = 70;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.01;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 30;

// ============================================
// 3. RENDERER
// ============================================
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ============================================
// 5. MATERIAL
// ============================================
const treeMaterial = new THREE.MeshBasicMaterial( { 
  color: 0x8a7c59,
  roughness: 0.9,
  metalness: 0.0 } 
);

// ============================================
// 4. GEOMETRY
// ============================================
const light = new AmbientLight(0xffffff, 0.5);
scene.add(light);

const geometry = new THREE.CircleGeometry( 14, 40 );
// remove outline
geometry.deleteAttribute('uv'); 
geometry.deleteAttribute('normal'); 
const positionAttribute = geometry.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
}
const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

// ============================================
// 5. MESH
// ============================================
const circleOutline = new THREE.LineLoop(outlineGeometry, treeMaterial);
scene.add(circleOutline);
circleOutline.position.y = 3.5;

const treeGroup = new THREE.Group();
scene.add(treeGroup);

let currentLevel = 0;
const maxGrowLevel = 7;

function buildTree() {
  treeGroup.clear();

  growLine(
    new THREE.Vector3(0, -3, 0),
    new THREE.Vector3(0, 1, 0),
    parameter.vector1,
    currentLevel
  );
}

window.addEventListener('click', () => {
  if (currentLevel < maxGrowLevel) {
    currentLevel++;
    buildTree();
  }
});



function drawBranch(start, end, radius = 0.6) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  const mesh = new THREE.Mesh(branchGeometry, treeMaterial);
 mesh.scale.set(radius, length, radius);


  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  mesh.position.copy(midpoint);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  treeGroup.add(mesh);
  
}

let angle = 0;
const maxLevel = 4;

//controls
const parameter = {
  vector1: 1,
  angle: 0.5,
  length: 1
};

gui.add(parameter, 'vector1', 0.5, 3, 0.1)
  .name('Branch Length')
  .onChange(buildTree);

gui.add(parameter, 'angle', 0, 0.6)
  .name('Angle')
  .onChange(buildTree);
  console.log (parameter.angle)

gui.add(parameter, 'length', 0, 2)
  .name('length')
  .onChange(buildTree);
  console.log (parameter.length)


function growLine(start, direction, length, level) {
  if (level <= 0) return;

  const end = start.clone().add(direction.clone().multiplyScalar(length));
  drawBranch(start, end, 0.08 * level / maxLevel);
  
  const dir1 = direction.clone().applyAxisAngle(
    new THREE.Vector3(0, 0, parameter.vector1),
    parameter.angle
  );

  const dir2 = direction.clone().applyAxisAngle(
    new THREE.Vector3(0, 0, 1),
    -parameter.angle
    
  );

  growLine(end, dir1, parameter.length * 2, level - 1);
  growLine(end, dir2, parameter.length * 2, level - 1);

  // angle += 0.01; 
 
}

growLine(
  new THREE.Vector3(0, -3, 0),
  new THREE.Vector3(0, 1, 0),
  4,
  7
);


// ============================================
// 7. RENDER LOOP
// ============================================
let scale = 1;
let scaleSpeed = 0.01;
let scaleDir = 1;

function getVisibleSize(camera) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { width, height };
};


function animate() {
  scene.rotation.y += 0.002;
   controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  
  //parameter.length += 0.002;
  //parameter.angle += 0.002;

};

animate();

// ============================================
// 8. HANDLE WINDOW RESIZE
// ============================================

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

