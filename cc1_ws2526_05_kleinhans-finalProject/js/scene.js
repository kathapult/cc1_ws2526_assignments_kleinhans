import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { initAudio, playAudio, getAudioData } from "./audio.js";
import { initModeTimeline, goToMode } from "./modeTimeline.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


console.log(THREE);

const gltfLoader = new GLTFLoader();
//const gui = new GUI();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// ============================================
// LAYOUT / UI / MODES
// ============================================

// ---- navbar ----
const navbar = document.querySelector(".navbar");
const headline = document.querySelector(".headlineContainer");

function updateHeadlineOffset() {
  const navHeight = navbar.offsetHeight;
  headline.style.top = navHeight + 40 + "px";
}

// ---- mode state for scene switch ---- 
let currentVisualMode = "home";
const headlineEl = document.getElementById("headline");

const modeHeadlines = {
  home: "Hühnernest <br> Festival",
  lineup: " Line Up ",
  gallery: "Festival"
};

function updateHeadline(mode) {
  if (!headlineEl || !modeHeadlines[mode]) return;


  gsap.to(headlineEl, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      headlineEl.innerHTML = modeHeadlines[mode];
      gsap.to(headlineEl, { opacity: 1, duration: 0.3 });
    }
  });
}

export function setVisualMode(mode) {
  if (currentVisualMode === mode) return;
  currentVisualMode = mode;

  updateHeadline(mode);

  if (mode === "lineup") {
    if (!artistCube) showLineupArtists();
    document.body.dataset.mode = "lineup";
  } else {
  
    if (artistCube) {
      scene.remove(artistCube);
      if (artistCube.geometry) artistCube.geometry.dispose();
      if (Array.isArray(artistCube.material)) {
        artistCube.material.forEach((mat) => {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      } else if (artistCube.material) {
        if (artistCube.material.map) artistCube.material.map.dispose();
        artistCube.material.dispose();
      }
      artistCube = null;
    }
    document.body.dataset.mode = mode;
  }
}

setVisualMode("home");

// ---- SET MODES Navigation ----
const navHome = document.querySelector(".nav-home");
const navLineup = document.querySelector(".nav-lineup");
const navGallery = document.querySelector(".nav-gallery");

if (navHome) navHome.addEventListener("click", () => {
  console.log("Home-Mode");
  goToMode("home");
});

if (navLineup) navLineup.addEventListener("click", () => {
  console.log("Lineup-Mode");
  goToMode("lineup");
});

if (navGallery) navGallery.addEventListener("click", () => {
  console.log("Gallery-Mode");
  goToMode("gallery");
});


// ============================================
// 1. SCENE
// ============================================
const scene = new THREE.Scene();
//scene.fog = new THREE.Fog(0x000000, 10, 100); 

// ---- light ----
const ambientLight = new THREE.AmbientLight(0xff8800, 0.4);
//scene.add(ambientLight);
ambientLight.userData.baseIntensity = 0.5;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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
    map: new THREE.TextureLoader().load("./assets/img/feather.png"),
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
const geometry = new THREE.SphereGeometry( 40, 60, 40 );
const mesh = new THREE.Mesh(geometry, bgMaterial);
mesh.position.y = 0;
mesh.receiveShadow = true;
scene.add( mesh );

// ---- disco ball ----
let discoBall;
let spotLight;
let lampLight;


// ---- lamp light ----
  lampLight = new THREE.PointLight(0xC8ABFF, 200, 900, 2);
  lampLight.position.set(0, 18, 0);
  lampLight.castShadow = true;

  lampLight.shadow.mapSize.width = 1024;
  lampLight.shadow.mapSize.height = 1024;
  lampLight.shadow.bias = -0.003;
  lampLight.shadow.radius = 4;
  lampLight.shadow.camera.near = 0.5;
  lampLight.shadow.camera.far = 50;

  //scene.add(lampLight);

  // ---- spotlight ----
  spotLight = new THREE.SpotLight(0xffffff, 200);

  spotLight.position.set(0, 10, 0);
  spotLight.angle = Math.PI * 0.2;      
  spotLight.penumbra = 0.5;// smoothness
  spotLight.decay = 2;
  spotLight.distance = 120;

  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.bias = -0.0001;

  scene.add(spotLight);
  scene.add(spotLight.target);


// ---- feather instancing ----
let featherSpeed = 0.01;
let lightSpeed = 0.02;

const motion = {
  featherRotationFactor: 1,
  featherWindFactor: 1
};

const featherCount = 300;
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
const cursorLight = new THREE.PointLight(0x00ffff, 200, 30, 2);
cursorLight.castShadow = true;
cursorLight.decay = 2;
cursorLight.intensity = 300;
scene.add(cursorLight);


// ---- LINEUP MODE Artist cube ----
let artistCube;
let magicCube;

export function showLineupArtists() {
  if (artistCube) return; // nicht doppelt erzeugen
  if (currentVisualMode !== "lineup") return; // NEU: nur bei Lineup-Modus

  const textureLoader = new THREE.TextureLoader();
  const textures = [
    textureLoader.load(new URL("../assets/img/klangflieder.png", import.meta.url).href),
    textureLoader.load(new URL("../assets/img/kammermusik.png", import.meta.url).href),
    textureLoader.load(new URL("../assets/img/bunny-minahri.png", import.meta.url).href),
    textureLoader.load(new URL("../assets/img/agnes.jpg", import.meta.url).href),
  ];

  const materials = [
    new THREE.MeshBasicMaterial({ map: textures[0] }),
    new THREE.MeshBasicMaterial({ map: textures[1] }),
    new THREE.MeshBasicMaterial({ color: 0x111111 }),
    new THREE.MeshBasicMaterial({ color: 0x111111 }),
    new THREE.MeshBasicMaterial({ map: textures[2] }),
    new THREE.MeshBasicMaterial({ map: textures[3] }),
  ];

  const geometry = new THREE.BoxGeometry(3, 3, 3);
  artistCube = new THREE.Mesh(geometry, materials);
  artistCube.position.set(5, 11, 3);

  // const direction = new THREE.Vector3();
  // direction.subVectors({ x: 0, y: 20, z: 6 }, artistCube.position);

  // const cameraAngleX = Math.atan2(direction.y, direction.z);
  // const cameraAngleY = Math.atan2(direction.x, direction.z);
  // const cameraAngleZ = Math.atan2(direction.x, direction.y);

  
  artistCube.lookAt(new THREE.Vector3( 0, 20, 6));
  artistCube.rotation.z=0
  
  scene.add(artistCube);
  magicCube = artistCube.rotation.y;
  setupArtistClickEvents();
  //rotateCubeToArtist(2);
}

function setupArtistClickEvents() {
  const names = document.querySelectorAll(".artist-name");

  names.forEach((name, i) => {

    name.style.transitionDelay = `${i * 0.3}s`;

    name.addEventListener("click", () => {
      const id = parseInt(name.dataset.id);
      rotateCubeToArtist(id);
    });
  });
}

// function getCubeRotationForSide(id) {
//   let sideRotationY = 0;

//   switch(id) {
//     case 0: sideRotationY = -Math.PI / 2; break; // rechte Seite (+X)
//     case 1: sideRotationY =  Math.PI / 2; break; // linke Seite (-X)
//     case 2: sideRotationY =  0;          break; // front (+Z)
//     case 3: sideRotationY =  Math.PI;   break; // back (-Z)
//   }

//   // angle to camera 
//   const dx = 0-artistCube.position.x//camera.position.x - artistCube.position.x;
//   const dz = 15-artistCube.position.z//camera.position.z - artistCube.position.z;
//   const cameraAngle = Math.atan2(dx, dz);

//   return cameraAngle + sideRotationY;
// }

function getCubeRotationForSide(id) {
  if (!artistCube) return 0;

  let sideRotationY = 0;

  switch (id) {
    case 0: sideRotationY = magicCube - Math.PI / 2; break;
    case 1: sideRotationY = magicCube + Math.PI / 2; break;
    case 2: sideRotationY = magicCube; break;
    case 3: sideRotationY = magicCube + Math.PI; break;
  }

  return sideRotationY;
}

let artistCubeTween = null;

function rotateCubeToArtist(id) {
  const targetRotationY = getCubeRotationForSide(id);

  if (artistCubeTween && artistCubeTween.isActive()) return;

  artistCubeTween = gsap.to(artistCube.rotation, {
    y: targetRotationY,
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      artistCubeTween = null; 
    }
  });
}


// ---- animated pointlights ----
function createMovingLight(color) {

  const intensity = 800; 
  const distance = 40;
  const lightBulb = new THREE.PointLight(color, intensity, distance, 2);
  lightBulb.castShadow = true;

  lightBulb.shadow.mapSize.width = 1024;
  lightBulb.shadow.mapSize.height = 1024;
  lightBulb.shadow.bias = -0.002;
  lightBulb.shadow.radius = 6;

  // center light
  const bulbGeometry = new THREE.SphereGeometry(0.5, 16, 8);
  const bulbMaterial = new THREE.MeshBasicMaterial({ color });
  const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
  lightBulb.add(bulbMesh);

  return lightBulb;
}

// ----- light shell texture -----
const shell=createShell()
const pointLight1 = createMovingLightWithShell(0x0088ff, shell);
const pointLight2 = createMovingLight(0xff8844);

function createShell() {
    const shellGeo = new THREE.SphereGeometry(4, 32, 16);

  // PNG texture
  const textureLoader = new THREE.TextureLoader();
  const alphaTexture = textureLoader.load("./assets/img/texture.png");

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: alphaTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const shell = new THREE.Mesh(shellGeo, shellMat);

  return shell;
}

function createMovingLightWithShell(color, shell) {

let intensity = 700;
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

  // shell texture
  shell.castShadow = true;
  shell.receiveShadow = true;
  light.add(shell);
  light.userData.shell = shell;
  return light;
}

pointLight1.userData.baseIntensity = 300;
pointLight2.userData.baseIntensity = 300;

scene.add(pointLight1);
scene.add(pointLight2);


// ============================================
// 7. RENDER LOOP
// ============================================

function getVisibleSize(camera) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { width, height };
}

let cubeRotation = 0;

function animate() {

//   if(currentVisualMode==='lineup'){

//    artistCube.rotateX(0.001);
// }

  requestAnimationFrame(animate);
  controls.update();

  const time = performance.now() * 0.001;

  // ----- LINEUP MODE audio + light control ----- 
  let normalized = 0;

  if (currentVisualMode === "lineup") {
    const audio = getAudioData();
    normalized = Math.pow(audio / 128, 2);
    const pulseStrength = 30; // pulse

    gsap.to(pointLight1.color, { r: 1, g: 0, b: 0.8, duration: 1 });
    gsap.to(pointLight2.color, { r: 0, g: 1, b: 1, duration: 1 });

    pointLight1.userData.baseIntensity = 800;
    pointLight2.userData.baseIntensity = 800;

    pointLight1.intensity = pointLight1.userData.baseIntensity * (1 + normalized * pulseStrength);
    pointLight2.intensity = pointLight2.userData.baseIntensity * (1 + normalized * pulseStrength);
    //ambientLight.intensity = 5 + normalized * 15;
    ambientLight.intensity = ambientLight.userData.baseIntensity * (1 + normalized * 0.5);

    if (pointLight1.userData.shell) {
      const scale = 1 + normalized * 2;
      pointLight1.userData.shell.scale.set(scale, scale, scale);
    }

  } else {
    gsap.to(pointLight1.color, { r: 1, g: 0.53, b: 0.26, duration: 1 });
    gsap.to(pointLight2.color, { r: 0, g: 0.53, b: 1, duration: 1 });


    pointLight1.userData.baseIntensity = 300;
    pointLight2.userData.baseIntensity = 300;

    pointLight1.intensity = pointLight1.userData.baseIntensity * (1 + normalized * 1);
    pointLight2.intensity = pointLight2.userData.baseIntensity * (1 + normalized * 1);
  }

   // ----- GENERAL LIGHT MOVEMENT ----- 
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
   
  // ----- DISCO SPOTLIGHT TARGET ----- 
  if (discoBall) {
    spotLight.target.position.copy(discoBall.position);
  }

  // ----- FEATHERS -----
  for (let i = 0; i < featherCount; i++) {
    const data = featherData[i];

    feathers.getMatrixAt(i, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    dummy.position.add(data.velocity);

    dummy.rotateX(data.rotationSpeed.x * motion.featherRotationFactor);
    dummy.rotateY(data.rotationSpeed.y * motion.featherRotationFactor);
    dummy.rotateZ(data.rotationSpeed.z * motion.featherRotationFactor);

    // wind & random motion
    data.velocity.x += Math.sin(time + i) * 0.0007 * motion.featherWindFactor;
    data.velocity.z += Math.cos(time + i) * 0.0007 * motion.featherWindFactor;

    if (dummy.position.y < 0) {
      dummy.position.y = 50;
      dummy.position.x = (Math.random() - 0.5) * 80;
      dummy.position.z = (Math.random() - 0.5) * 80;
    }
    
    let scale = 1; // scale pulse depending on mode
    if (currentVisualMode === "lineup") {
      scale = 1 + normalized * 2;
    }

    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    feathers.setMatrixAt(i, dummy.matrix);
  }

  feathers.instanceMatrix.needsUpdate = true;


  // ----- CURSOR LIGHT ----- 
  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = 30;

  cursorLight.position.copy(camera.position).add(dir.multiplyScalar(distance));

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mesh);

  if (intersects.length > 0) {
    cursorLight.position.copy(intersects[0].point);
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

updateHeadlineOffset();
window.addEventListener("resize", updateHeadlineOffset);


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




// ============================================
// EXPORTS
// ============================================
// ---- LINE UP artist animation -----

// load Disco-Ball 
if (!discoBall) {
  gltfLoader.load("./assets/models/disco.glb", (gltf) => {
    discoBall = gltf.scene;
    discoBall.position.set(0, 15, 0);
    discoBall.scale.set(1, 1, 1);

    discoBall.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = 1;
        child.material.roughness = 0.1;
      }
    });

    scene.add(discoBall);
    spotLight.target.position.copy(discoBall.position);

    initTimelinesWhenReady();
  });
}

// ---- start timeline ----
const djPult = document.querySelector(".DJpult");
function initTimelinesWhenReady() {
  if (!camera || !djPult || !ambientLight || !spotLight || !lampLight || !pointLight1 || !pointLight2 || !discoBall) return;

  initModeTimeline({
    camera,
    djPult,
    ambientLight,
    spotLight,
    lampLight,
    pointLight1,
    pointLight2,
    discoBall,
    motion,
    scene,
    setVisualMode
  });
}


// ---- EXPORTS ----
export { camera, scene, djPult, discoBall, spotLight, lampLight, pointLight1, pointLight2, ambientLight, motion, shell };


