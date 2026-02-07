import * as THREE from "three";
import { createNoise2D } from 'simplex-noise';

console.log(THREE);

// ============================================
// 1. SCENE
// ============================================
const scene = new THREE.Scene();
const circleAmount = 20;

// ============================================
// 2. CAMERA
// ============================================
const fov = 70;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 8;

// ============================================
// 3. RENDERER
// ============================================
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// ============================================
// 4. GEOMETRY
// ============================================
//const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const geometry = new THREE.CircleGeometry( 1, 40 );

// 2. Remove the center vertex / outline
geometry.deleteAttribute('uv'); 
geometry.deleteAttribute('normal'); 
const positionAttribute = geometry.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
}
const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

// ============================================
// 5. MATERIAL
// ============================================
const material = new THREE.MeshBasicMaterial( { color: 0x929699 } );

// ============================================
// 6. MESH
// ============================================
const circle = new THREE.Mesh(geometry, material);
const circleOutline = new THREE.LineLoop(outlineGeometry, material);
const circles = [];
const maxDisplace = 0.25;
const noise2D = createNoise2D();

for (let i = 0; i < circleAmount; i++) {

  const circle = new THREE.LineLoop(outlineGeometry, material);
  const baseScale = 1 - i * 0.03 + noise2D(i * 0.2, 0) * 5;

  circle.userData = {
    baseScale,
    scale: baseScale,
    dir: 1,
    speed: 0.005
  };

  scene.add(circle);
  circles.push(circle);
}


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
}

let hue = 0;
let cameraZ = 0;
const cameraSpeed = 20; //change e.g. between 2 - 20

function animate() {
  const { width, height } = getVisibleSize(camera);
  
  circles.forEach(circle => {
    const data = circle.userData;
    
    data.scale += data.speed * data.dir;
    circle.scale.setScalar(data.scale);
    const radius =
      geometry.parameters.radius * data.scale;

    if (radius >= width || radius >= height) {
      data.dir = -2;
    }

    if (radius <= 0.2) {
      data.dir = 1;
    }
  });

  //changing color
  hue += 0.001;   

  if (hue > 1) hue = 0;
  material.color.setHSL(hue, 0.5, 0.5);

  //camera changing
  cameraZ += 0.01;   

  if (cameraZ > cameraSpeed) cameraZ = 0;
  camera.position.z = cameraZ;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Start the animation loop
animate();

// ============================================
// 8. HANDLE WINDOW RESIZE
// ============================================
function onWindowResize() {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);
