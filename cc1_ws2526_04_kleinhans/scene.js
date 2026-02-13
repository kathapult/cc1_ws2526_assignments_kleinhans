import * as THREE from "three";
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
const light = new AmbientLight(0xffffff, 0.5);
scene.add(light);


// ---- GUI controls ----
const parameter = {
  vector1: 1,
  angle: 0.5,
  length: 1,
  yOffset: -9,
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


// ============================================
// 2. CAMERA
// ============================================
const fov = 70;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.01;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 50;

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
//
const geoBranch = new THREE.CylinderGeometry(1, 1, 1, 6);
const geometry = new THREE.CircleGeometry( 22, 20 );
const geoTrigger = new THREE.CircleGeometry( 20, 12 );

// outline
geometry.deleteAttribute('uv'); 
geometry.deleteAttribute('normal'); 
const positionAttribute = geometry.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
}

const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

// ---- circle instancing ---- 
const radius = 22;
const segments = 24;
const starGeometry = createCompassStarGeometry(0.6, 0.3);

const instancedMesh = new THREE.InstancedMesh(
  starGeometry,
  treeMaterial,  
  segments
);

const dummy = new THREE.Object3D();
for (let i = 0; i < segments; i++) {
  const angle = (i / segments) * Math.PI * 2;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  dummy.position.set(x, z, 0);
  
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}

// ---- star instance ----
function createCompassStarGeometry(
  longRadius = 0.6,
  shortRadius = 0.3
) {
  const shape = new THREE.Shape();
  const points = 8;
  const step = (Math.PI * 2) / points;

  for (let i = 0; i < points; i++) {

    const isMainAxis = i % 2 === 0;
    const radius = isMainAxis ? longRadius : shortRadius;

    const angle = i * step;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  shape.closePath();

  return new THREE.ShapeGeometry(shape);
}


// ============================================
// 5. MESH
// ============================================
const trigger = new THREE.Mesh(geoTrigger, outlineGeometry);
//const resetBtn = new THREE.Mesh(geoTrigger, outlineGeometry);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


instancedMesh.position.y = 12;
trigger.position.y = 3.5;
trigger.position.z = 2;


// ---- tree ----
const treeGroup = new THREE.Group();
treeGroup.position.y = 12;
let startLevel = 7;


function buildTree() {
  treeGroup.clear();

  const levelToUse = currentLevel === 1 ? startLevel : currentLevel;

  growLine(
    new THREE.Vector3(0, -3, 0),
    new THREE.Vector3(0, 1, 0),
    parameter.vector1,
    levelToUse
  );
}

// branch 
let currentLevel = 1;
let growFactor = 0.5;

function drawBranch(start, end, radius = 1.6) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  const mesh = new THREE.Mesh(geoBranch, treeMaterial);
  mesh.scale.set(radius, length, radius);


  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  mesh.position.copy(midpoint);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  treeGroup.add(mesh);
}


let maxLevel = 7;

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
}

growLine (
  new THREE.Vector3(0, -3, 0),
  new THREE.Vector3(0, 1, 0),
  4,
  7
);

scene.add(treeGroup);
scene.add(instancedMesh);
scene.add(trigger);


// ---- chicken ----
import { Chicken } from './chicken.js';

const chicken = new Chicken({
  spacing: 2,
  patternIndex: 2,
  scale: 24,
  yOffset: 4

});



// ---- click event ----
let rotateCircle = false;
let treeFinished = false;


window.addEventListener('click', (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObject(trigger);

    if (hits.length > 0) {
        console.log('trigger');

        if (!treeFinished) {
            growFactor = Math.min(growFactor + 0.2, 2);
            currentLevel = Math.min(currentLevel + 1, maxLevel);

            parameter.length = growFactor;
            buildTree();

            if (currentLevel === 2) {
                document.getElementById("headline").textContent = "Unlock the secrets of the white tree";
            }
            if (currentLevel === 3) {
                document.getElementById("headline").textContent = "Ascend the path of ancient branches";
            }
            if (currentLevel === 4) {
                document.getElementById("headline").textContent = "A shadow flutters above";
            }
            if (currentLevel === 5) {
                document.getElementById("headline").textContent = "And a new heir awakens";
            }
            if (currentLevel === 6) {
                document.getElementById("headline").textContent = "From bark to beak";
            }

            if (currentLevel === maxLevel) {
                document.getElementById("headline").textContent = "Minas Chick";
                document.getElementById("headline").style.fontSize = "3rem";
                scene.add(chicken.group);
                rotateCircle = true;
                treeFinished = true;
                scene.remove(trigger);
                //scene.add(resetBtn);
            }
        }
    }
});



// ============================================
// 7. RENDER LOOP
// ============================================
function getVisibleSize(camera) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { width, height };
};

let rotationZ = 0;
let circleRotation = 0 

function animate() {

  controls.update();

  if (currentLevel === maxLevel) {
    rotationZ += 0.01; 
    const dummy = new THREE.Object3D();

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      dummy.position.set(x, y, 0);
      dummy.rotation.set(0, 0, rotationZ);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  if (rotateCircle){
     instancedMesh.rotation.z += 0.002;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  circleRotation += 0.002;
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

