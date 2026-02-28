import * as THREE from "three";
import { createNoise2D } from 'simplex-noise';
import { seededRandom } from "three/src/math/MathUtils.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const gltfLoader = new GLTFLoader();
const gui = new GUI();

console.log(THREE);

// 1. SCENE
const scene = new THREE.Scene();
//new OrbitControls( object : Object3D, domElement : HTMLElement );


// 2. CAMERA
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera( 
  -aspect * 5,
   aspect * 5,
   5,
  -5,
  0.1,
  100);
camera.position.z = 10;


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);


// 3. RENDERER
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 4. GEOMETRY

// gltfLoader.load("./material/chicken.glb", (gltf) => {
//   console.log(gltf);
//   const chicken = gltf.scene;
//   chicken.scale.set(2, 2, 2);

//   scene.add(chicken);
// });


const geometryCircle = new THREE.CircleGeometry( 3, 20 );
const positionAttribute = geometryCircle.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i ));
}
const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1, 5, 2),
    new THREE.Vector3( 2, -5, 20)
  ]),
  new THREE.LineBasicMaterial({ color: 0x122550 })
);

const geometrySphereSmall = new THREE.BoxGeometry( 2.4, 20 );
const geometryIco = new THREE.IcosahedronGeometry(1);
const geometryBox = new THREE.BoxGeometry(1, 1);


// 5. MATERIALx
//colors
const palette = {
  green: 0x96E62E,
  yellow: 0xFAE650,
  violet: 0x8A2EE6,
  darkViolet: 0x574766,
  darkGreen: 0x596647
};

const colors = ['#0a581f', '#FAE650', '#8A2EE6'];

const randomColor =
    colors[Math.floor(Math.random() * colors.length)];
console.log(randomColor);

const materialGreen = new THREE.MeshBasicMaterial( { color: 'green' } );
const materialYellow = new THREE.MeshBasicMaterial( { color: 'yellow' } );
const materialViolet = new THREE.MeshBasicMaterial( { color: 'violet' } );
const materialDarkViolet = new THREE.MeshBasicMaterial( { color:  'darkViolet' } );
const materialDarkGreen = new THREE.MeshBasicMaterial( { color:  'darkGreen' } );

const toonMaterial = new THREE.MeshPhongMaterial({
  color: 'darkViolet'

});


// 6. MESH
const sphereGroup = new THREE.Group();
const icoGroup = new THREE.Group();
scene.add(sphereGroup);
scene.add(icoGroup);

const circle = new THREE.LineLoop(outlineGeometry, materialGreen);
circle.position.z = 2;

const ico = new THREE.Mesh( geometryIco, toonMaterial );
const box = new THREE.Mesh( geometryBox, toonMaterial );

const settings = {
  rotationSpeed: 0.01,
  boxScale: 1,
  icoScale: 1,
};


gui.add(settings, "boxScale", 0.1, 3)
  .name("Box Scale")
  .onChange(v => {
    sphereGroup.children.forEach(child => {
      const base = child.userData.baseScale;
      child.scale.set(
        base.x * v,
        base.y * v,
        base.z * v
      );
    });
  });

gui.add(settings, "boxScale", 0.1, 3)
  .name("Box Scale")
  .onChange(v => {
    sphereGroup.children.forEach(child => {
      const base = child.userData.baseScale;
      child.scale.set(
        base.x * v,
        base.y * v,
        base.z * v
      );
    });
  });

  gui.add(circle.scale, "x", 0.1, 5)
  .name("Circle Scale")
  .onChange(v => circle.scale.setScalar(v));



gui.add(settings, "rotationSpeed", 0, 0.05)
   .name("Rotation Speed");

const boxMesh = new THREE.Mesh(geometryBox, toonMaterial);
const randomSeedSphere = 20;
const randomSizeSphere = 0.5;

const icoMesh = new THREE.Mesh(geometryIco, toonMaterial);
icoMesh.position.z = -20;
const randomSeedIco = 30;
const randomSizeIco = 1.2;


function createCloneSphere(mesh) {

  let i = -10;
  
  while (i < 20) {
    const mesh = box.clone();
  
    const x = i - 1;
    const z = THREE.MathUtils.randFloatSpread(randomSeedSphere);
    const sizeX = THREE.MathUtils.randFloat(0.1, randomSizeSphere);
    const sizeY = THREE.MathUtils.randFloat(0.1, randomSizeSphere);

    mesh.scale.set(sizeX, sizeY, sizeX);
    mesh.userData.baseScale = new THREE.Vector3(sizeX, sizeY, sizeX);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    mesh.material = new THREE.MeshToonMaterial({ color: new THREE.Color(randomColor) });

    mesh.position.set(x, z, 0);
    mesh.scale.set(sizeX, sizeY, sizeX);
    mesh.lookAt(boxMesh.position);
    sphereGroup.add(mesh); 
    i += 0.1;

    mesh.rotation.x += i + 0.01;
    mesh.rotation.y += i + 0.01;
  }

  
}



function createCloneIco(meshIco) {

  let i = -10;
  
  while (i < 20) {
    const meshIco = ico.clone();
    const rad = Math.PI * 2 * (i / 10);
    const x = i - 1;
    const z = THREE.MathUtils.randFloatSpread(randomSeedIco);
    const sizeX = THREE.MathUtils.randFloatSpread(randomSizeIco);
    const sizeY = THREE.MathUtils.randFloatSpread(randomSizeIco);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    meshIco.material = new THREE.MeshToonMaterial({ color: new THREE.Color(randomColor) });

    meshIco.position.set(x, z, 0);
    meshIco.scale.set(sizeX, sizeY, sizeX);
    meshIco.userData.baseScale = new THREE.Vector3(sizeX, sizeY, sizeX);
    meshIco.lookAt(ico.position);
    icoGroup.add(meshIco); 
    i += 0.1;

    meshIco.rotation.x += i + 0.01;
    meshIco.rotation.y += i + 0.010;
  }
}


createCloneSphere(boxMesh);
createCloneIco(icoMesh);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
scene.add(line);
scene.add(circle);
scene.add(ico);
scene.add(box);
scene.add(boxMesh);



// 7. RENDER LOOP
let scale = 1;
let scaleSpeed = 0.01;
let scaleDir = 1;

function getVisibleSize(camera) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { width, height };
}


function animate() {
  sphereGroup.children.forEach(child => {
    child.rotation.x  += settings.rotationSpeed;
    child.rotation.y += settings.rotationSpeed;
  });

  icoGroup.children.forEach(child => {
    child.rotation.x += settings.rotationSpeed;
    child.rotation.y += settings.rotationSpeed;
  });


  ico.rotation.x += 0.001;
  ico.rotation.y += 0.001;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  controls.update();
}

animate();


// 8. HANDLE WINDOW RESIZE

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
  window.addEventListener("resize", onWindowResize);
