import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from "gsap";
import { initAudio, playAudio, getAudioData } from "./audio.js";

const gltfLoader = new GLTFLoader();
//const gui = new GUI();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

console.log(THREE);


// ============================================
// LAYOUT / UI / MODES
// ============================================

// ---- navbar ----
const navbar = document.querySelector(".navbar");
const headline = document.querySelector(".headlineContainer");

function updateHeadlineOffset() {
  const navHeight = navbar.offsetHeight;
  headline.style.top = navHeight + 30 + "px";
}
  
// ---- switch modes ----
import { setMode } from "./sceneController.js";

document.querySelector(".nav-home")
.addEventListener("click", () => setMode("home"));

document.querySelector(".nav-lineup")
  .addEventListener("click", (e) => {

    e.preventDefault();

    // 🔓 AudioContext entsperren
    const audioContext = THREE.AudioContext.getContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // ▶ Audio starten
    playAudio();

    setMode("lineup");
  });
document.querySelector(".nav-gallery")
  .addEventListener("click", () => setMode("gallery"));

updateHeadlineOffset();
window.addEventListener("resize", updateHeadlineOffset);

const djPult = document.querySelector(".DJpult");

// ---- overlay ----
const overlay = document.getElementById("canvasOverlay");
const ctx = overlay.getContext("2d");

overlay.width = window.innerWidth;
overlay.height = window.innerHeight;

function drawOverlay() {
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.fillStyle = "rgba(255, 149, 0, 1)";
  requestAnimationFrame(drawOverlay);
}

drawOverlay();


// ---- CLICK EVENTS ----

// document.querySelector(".nav-link").addEventListener("click", () => {

//   gsap.to(camera.position, {
//     x: 0,
//     y: 20,
//     z: 30,
//     duration: 2
//   });

// });

// ============================================
// 1. SCENE
// ============================================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 100); 

// ---- light ----
const ambientLight = new THREE.AmbientLight(0xff8800, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;

// ---- font ----
// const loader = new FontLoader();

// loader.load(
//   './fonts/lostar_regular.json',  
//   function (font) {

//     const geometry = new TextGeometry('HÜHNERNEST', {
//       font: font,
//       size: 1,
//       height: 0.01,
//       curveSegments: 12,
//       bevelEnabled: false
//     });

//     const material = new THREE.MeshStandardMaterial({ color: 0x7d16ff});
//     const textMesh = new THREE.Mesh(geometry, material);

//     geometry.computeBoundingBox();
//     const bbox = geometry.boundingBox;

//     // Breite und Höhe des Textes
//     const textWidth = bbox.max.x - bbox.min.x;
//     const textHeight = bbox.max.y - bbox.min.y;

//     // Text zentrieren
//     geometry.translate(-textWidth / 2, -textHeight / 2, 0);
//     textMesh.scale.set(6, 6, 0.01); 
//     textMesh.position.set(0, -5, 15);

//     scene.add(textMesh);

//     mesh.castShadow = true;    // dein Text oder Lampe
//     mesh.receiveShadow = true; // Wände oder Kugel innen
//     textMesh.castShadow = true;
//   }
// );


// ============================================
// 2. CAMERA
// ============================================
const fov = 50;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 50;

initAudio(camera);

// ============================================
// 3. RENDERER
// ============================================
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ============================================
// 5. MATERIAL
// ============================================
let color = 0xffffff;

 // ---- box --- 
 const bgMaterial = new THREE.MeshPhongMaterial({
  color: 0xa0adaf,
  shininess: 10,
  specular: 0x111111,
  side: THREE.BackSide
});


// ---- feathers ----
 const featherMaterial = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });

const featherMat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load("./public/img/feather.png"),
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  
 // ---- particle ----
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffee88,
    size: 0.1,
    transparent: true,
    opacity: 0.3
  });



// ============================================
// 4. GEOMETRY
// ============================================

// ---- box ----
const geometry = new THREE.SphereGeometry( 40, 46, 40 );
//const geometry = new THREE.SphereGeometry( 50, 46, 50 );

const mesh = new THREE.Mesh( geometry, bgMaterial );
mesh.position.y = 0;
mesh.receiveShadow = true;
scene.add( mesh );

// ---- lamp ----

// let lampMesh;
// let lampLight;

// gltfLoader.load("./models/lamp.glb", (gltf) => {

//   lampMesh = gltf.scene;
//   lampMesh.scale.set(1, 1, 1);
//   lampMesh.position.set(0, 0, 0);
//   scene.add(lampMesh);

//   // shadow-caster
//   lampMesh.traverse((child) => {
//     if (child.isMesh) {
//       child.castShadow = true;
//       child.receiveShadow = false; 
//       child.material.side = THREE.FrontSide;
//     }
//   });

// });


// ---- disco ball ----
let discoBall;
let spotLight;
let lampLight;

gltfLoader.load("./public/models/disco.glb", (gltf) => {

  discoBall = gltf.scene;
  discoBall.position.set(0, 20, 0);
  discoBall.scale.set(1, 1, 1);

  discoBall.traverse((child) => {
    if (child.isMesh) {
      child.material.metalness = 1;
      child.material.roughness = 0.1;
      //child.material.envMap = cubeRenderTarget.texture;
    }
  });

  scene.add(discoBall);

// ---- lamp light 

  lampLight = new THREE.PointLight(0xC8ABFF, 2000, 900, 2);

  lampLight.position.set(0, 18, 0);

  lampLight.castShadow = true;

  lampLight.shadow.mapSize.width = 1024;
  lampLight.shadow.mapSize.height = 1024;

  lampLight.shadow.bias = -0.003;
  lampLight.shadow.radius = 4;

  lampLight.shadow.camera.near = 0.5;
  lampLight.shadow.camera.far = 50;

  scene.add(lampLight);


  // ---- spotlight ----
  spotLight = new THREE.SpotLight(0xffffff, 2000);

  spotLight.position.set(0, 10, 0);
  spotLight.angle = Math.PI * 0.2;      
  spotLight.penumbra = 0.5;// smoothness
  spotLight.decay = 2;
  spotLight.distance = 120;

  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.bias = -0.0005;

  scene.add(spotLight);
  scene.add(spotLight.target);
});

// ---- instancing ----
const featherCount = 150;
const featherGeo = new THREE.PlaneGeometry(0.2, 1);
const feathers = new THREE.InstancedMesh(featherGeo, featherMat, featherCount);
scene.add(feathers);

const dummy = new THREE.Object3D();
const featherData = []; // save position & velocity

for (let i = 0; i < featherCount; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 80, 
        Math.random() * 50, 
        (Math.random() - 0.5) * 80
    );

    dummy.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
    );

    dummy.updateMatrix();
    feathers.setMatrixAt(i, dummy.matrix);

    // save velocity & rotation speed for animation
    featherData.push({
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            -Math.random() * 0.02,
            (Math.random() - 0.5) * 0.05
        ),
        rotationSpeed: new THREE.Vector3(
            Math.random() * 0.01,
            Math.random() * 0.01,
            Math.random() * 0.01
        )
    });
}

// ---- fog ----
let allParticles; 
const particleCount = 5000;
const roomWidth = 100;
const roomHeight = 100;
const roomDepth = 100;

const particleGeometry = new THREE.BufferGeometry();
const particles = [];

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * roomWidth;
  const y = Math.random() * roomHeight;
  const z = (Math.random() - 0.5) * roomDepth;
  particles.push(x, y, z);
}

particleGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(particles, 3)
);

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// ---- cursor light ----
const cursorLight = new THREE.PointLight(0x00ffff, 400, 30, 2);
cursorLight.castShadow = true;
scene.add(cursorLight);

cursorLight.decay = 1;
cursorLight.intensity = 500;


// ---- animated pointlights ----
function createMovingLight(color) {

const intensity = 800; // WebGL braucht weniger als WebGPU
const distance = 40;
const light = new THREE.PointLight(color, intensity, distance, 2);
light.castShadow = true;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.bias = -0.002;
light.shadow.radius = 6;

// center light
const bulbGeometry = new THREE.SphereGeometry(0.5, 16, 8);
const bulbMaterial = new THREE.MeshBasicMaterial({ color });
const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
light.add(bulbMesh);

return light;
}

const pointLight1 = createMovingLightWithShell(0x0088ff);
function createMovingLightWithShell(color) {

  const intensity = 700;
  const distance = 50;
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.bias = -0.002;
  light.shadow.radius = 6;

  // light
  const bulbGeo = new THREE.SphereGeometry(0.6, 16, 12);
  const bulbMat = new THREE.MeshBasicMaterial({ color });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  light.add(bulb);

  // shell
  const shellGeo = new THREE.SphereGeometry(4, 32, 16);
  //const alphaTexture = createStripedTexture();

  // const shellMat = new THREE.MeshStandardMaterial({
  //   color: color,
  //   side: THREE.DoubleSide,
  //   alphaMap: alphaTexture,
  //   alphaTest: 0.5
  // });

  // ---- PNG texture ----
  const textureLoader = new THREE.TextureLoader();
  const alphaTexture = textureLoader.load("./public/img/texture.png");

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: alphaTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  light.add(shell);
  light.userData.shell = shell;
  return light;
}

const pointLight2 = createMovingLight(0xff8844);
scene.add(pointLight1);
scene.add(pointLight2);

function createStripedTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;

  const context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, 4, 4);
  context.fillStyle = "black";
  context.fillRect(0, 2, 4, 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 6); // Anzahl Streifen
  texture.magFilter = THREE.NearestFilter;

  return texture;
}


// ============================================
// 7. RENDER LOOP
// ============================================

function getVisibleSize(camera) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { width, height };
}

function animate() {

  requestAnimationFrame(animate);
  controls.update();

   // ---- audio ----
  const data = getAudioData();
  const normalized = Math.pow(data / 256, 2);
  const baseIntensity = 700;
  const pulse = normalized * 400;

pointLight1.intensity = baseIntensity + pulse;
pointLight2.intensity = baseIntensity + pulse * 0.8;

  // ---- discoball ----
  if (discoBall) {
  spotLight.target.position.copy(discoBall.position);
  }

  // ---- lights -----
  const time = performance.now() * 0.001;

  pointLight1.position.x = Math.sin(time * 0.6) * 20;
  pointLight1.position.y = Math.sin(time * 0.7) * 10 + 15;
  pointLight1.position.z = Math.sin(time * 0.8) * 20;

  const t2 = time + 10;

  pointLight2.position.x = Math.sin(t2 * 0.6) * 20;
  pointLight2.position.y = Math.sin(t2 * 0.7) * 10 + 15;
  pointLight2.position.z = Math.sin(t2 * 0.8) * 20;

  if (pointLight1.userData.shell) {
    pointLight1.userData.shell.rotation.x += 0.01;
    pointLight1.userData.shell.rotation.z += 0.01;
  }

  // if (lampLight) {
  //   const time = performance.now() * 0.001;

  //   const pulse = Math.sin(time * 3) * 800;       // langsames Pulsieren
  //   const flicker = (Math.random() - 0.5) * 150;  // schnelles Flackern

  //   lampLight.intensity = 1500 + pulse + flicker;
  // }

  // if (lampMesh) {
  //   lampMesh.rotation.y += 0.0005;
  // }


  // ---- feathers ----
  for (let i = 0; i < featherCount; i++) {
    const data = featherData[i];

    feathers.getMatrixAt(i, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

    // Bewegung
    dummy.position.add(data.velocity);

    // Rotation
    dummy.rotateX(data.rotationSpeed.x);
    dummy.rotateY(data.rotationSpeed.y);
    dummy.rotateZ(data.rotationSpeed.z);

    // Wind / Noise
    data.velocity.x += Math.sin(time + i) * 0.0007;
    data.velocity.z += Math.cos(time + i) * 0.0007;

    // Reset wenn zu tief
    if (dummy.position.y < 0) {
        dummy.position.y = 50;
        dummy.position.x = (Math.random() - 0.5) * 80;
        dummy.position.z = (Math.random() - 0.5) * 80;
    }

    dummy.updateMatrix();
    feathers.setMatrixAt(i, dummy.matrix);
}
feathers.instanceMatrix.needsUpdate = true;


  // ---- cursor light ----
  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);

  const dir = vector.sub(camera.position).normalize();
  const distance = 30;

  cursorLight.position.copy(camera.position).add(dir.multiplyScalar(distance));

  // raycaster
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mesh);

  if (intersects.length > 0) {
      cursorLight.position.copy(intersects[0].point);
  } else { // fallback
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = 30;
    cursorLight.position.copy(camera.position).add(dir.multiplyScalar(distance));
  }

  renderer.render(scene, camera);
}

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

  window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});



// ---- EXPORTS ----
export { camera, scene, djPult, discoBall, spotLight, lampLight, pointLight1, pointLight2, ambientLight };