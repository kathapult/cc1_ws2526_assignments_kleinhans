import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const gltfLoader = new GLTFLoader();
const gui = new GUI();

// ============================================
// 1. SCENE
// ============================================
const scene = new THREE.Scene();

/*
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
ambient.intensity = 1.5;
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4dd, 1.2);
sun.position.set(5, 10, 5);
sun.intensity = 1.5;
scene.add(sun);

const backLight = new THREE.DirectionalLight(0x88aaff, 0.4);
backLight.position.set(-5, 5, -5);
backLight.intensity = 5;
scene.add(backLight);
*/

const loader = new THREE.TextureLoader().setPath('textures/');
const filenames = ['disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg'];
const textures = { none: null };

for (let i = 0; i < filenames.length; i++) {
  const texture = loader.load(filenames[i]);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  textures[filenames[i]] = texture;
}

let spotLight;

const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
scene.add(ambient);

spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.name = 'spotLight';
spotLight.map = textures['disturb.jpg'];
spotLight.position.set(5, 8, 12);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 1;
spotLight.decay = 2;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 2;
spotLight.shadow.camera.far = 10;
spotLight.shadow.focus = 1;
spotLight.shadow.bias = -0.003;
spotLight.shadow.intensity = 1;
scene.add(spotLight);

spotLight.lightHelper = new THREE.SpotLightHelper(spotLight);
spotLight.lightHelper.visible = false;
scene.add(spotLight.lightHelper);

spotLight.shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotLight.shadowCameraHelper.visible = false;
scene.add(spotLight.shadowCameraHelper);

// ============================================
// 2. CAMERA
// ============================================
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.z = 10;

// ============================================
// 3. RENDERER
// ============================================
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ============================================
// 5. MATERIAL
// ============================================
const treeMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a7c59,
  roughness: 0.9,
  metalness: 0.0
});

// ============================================
// 4. GEOMETRY
// ============================================
const branchGeometry = new THREE.CylinderGeometry(1, 0.8, 1, 6);
const MAX_BRANCHES = 512;

const treeMesh = new THREE.InstancedMesh(branchGeometry, treeMaterial, MAX_BRANCHES);
treeMesh.castShadow = true;
scene.add(treeMesh);

let branchIndex = 0;

const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpScale = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

// controls
const parameter = {
  vector1: 1,
  angle: 0.5,
  length: 1
};

gui.add(parameter, 'vector1', 0.5, 3, 0.1).name('Branch Length').onChange(buildTree);
gui.add(parameter, 'angle', 0, 0.6).name('Angle').onChange(buildTree);
gui.add(parameter, 'length', 0, 2).name('length').onChange(buildTree);

const maxLevel = 7;

function drawBranch(start, end, radius) {
  tmpDir.subVectors(end, start);
  const len = tmpDir.length();
  tmpQuat.setFromUnitVectors(up, tmpDir.normalize());
  tmpScale.set(radius, len, radius);
  tmpMatrix.compose(start.clone().add(end).multiplyScalar(0.5), tmpQuat, tmpScale);
  treeMesh.setMatrixAt(branchIndex++, tmpMatrix);
}

function growLine(start, direction, length, level) {
  if (level <= 0 || branchIndex >= MAX_BRANCHES) return;

  const end = start.clone().add(direction.clone().multiplyScalar(length));
  drawBranch(start, end, 0.08 * level / maxLevel);

  const dir1 = direction.clone().applyAxisAngle(new THREE.Vector3(0, 0, parameter.vector1), parameter.angle);
  const dir2 = direction.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -parameter.angle);

  growLine(end, dir1, parameter.length * 2, level - 1);
  growLine(end, dir2, parameter.length * 2, level - 1);

  // angle += 0.01;
}

function buildTree() {
  branchIndex = 0;
  growLine(new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 1, 0), 4, maxLevel);
  treeMesh.count = branchIndex;
  treeMesh.instanceMatrix.needsUpdate = true;
}

buildTree();

// ============================================
// 7. RENDER LOOP
// ============================================
function animate() {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(animate);

  // parameter.length += 0.002;
  // parameter.angle += 0.002;
  // buildTree();
}

animate();

// ============================================
// GUI – LIGHT CONTROLS
// ============================================
const params = {
  map: textures['disturb.jpg'],
  color: spotLight.color.getHex(),
  intensity: spotLight.intensity,
  distance: spotLight.distance,
  angle: spotLight.angle,
  penumbra: spotLight.penumbra,
  decay: spotLight.decay,
  focus: spotLight.shadow.focus,
  shadowIntensity: spotLight.shadow.intensity,
  helpers: false
};

gui.add(params, 'map', textures).onChange(v => spotLight.map = v);
gui.addColor(params, 'color').onChange(v => spotLight.color.setHex(v));
gui.add(params, 'intensity', 0, 500).onChange(v => spotLight.intensity = v);
gui.add(params, 'distance', 0, 20).onChange(v => spotLight.distance = v);
gui.add(params, 'angle', 0, Math.PI / 3).onChange(v => spotLight.angle = v);
gui.add(params, 'penumbra', 0, 1).onChange(v => spotLight.penumbra = v);
gui.add(params, 'decay', 1, 2).onChange(v => spotLight.decay = v);
gui.add(params, 'focus', 0, 1).onChange(v => spotLight.shadow.focus = v);
gui.add(params, 'shadowIntensity', 0, 1).onChange(v => spotLight.shadow.intensity = v);
gui.add(params, 'helpers').onChange(v => {
  spotLight.lightHelper.visible = v;
  spotLight.shadowCameraHelper.visible = v;
});

gui.open();

// ============================================
// 8. RESIZE
// ============================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
