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

gltfLoader.load("./material/chicken.glb", (gltf) => {
  console.log(gltf);
  const chicken = gltf.scene;
  chicken.scale.set(2, 2, 2);

  scene.add(chicken);
});


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

const geometrySphere = new THREE.SphereGeometry( 0.1, 0.3 );
const geometrySphereSmall = new THREE.BoxGeometry( 2.4, 20 );
const geometryIco = new THREE.IcosahedronGeometry(2);
const geometryBox = new THREE.BoxGeometry(2, 2);


// 5. MATERIALx
//colors
const palette = {
  green: 0x96E62E,
  yellow: 0xFAE650,
  violet: 0x8A2EE6,
  darkViolet: 0x574766,
  darkGreen: 0x596647
};

const colors = ['#1e8123ff', '#FAE650', '#8A2EE6'];

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
const circle = new THREE.LineLoop(outlineGeometry, materialGreen);
circle.position.z = 2;

//const sphere = new THREE.Mesh( geometrySphere, materialGreen );
const sphereSmall = new THREE.Mesh( geometrySphereSmall, materialYellow );
sphereSmall.position.z = -2;
const ico = new THREE.Mesh( geometryIco, toonMaterial );
gui.add(ico.scale, 'y', 0, 4).name('Ico scale Y');
const box = new THREE.Mesh( geometryBox, toonMaterial );
gui.add(box.scale, 'y', 0, 4).name('Box scale Y');

const boxMesh = new THREE.Mesh(geometryBox, toonMaterial);
const randomSeedSphere = 20;
const randomSizeSphere = 0.5;

const icoMesh = new THREE.Mesh(geometryIco, toonMaterial);
icoMesh.position.z = -20;
const randomSeedIco = 30;
const randomSizeIco = 1.2;

function createCloneSphere(mesh) {

  let i = -10;
  
  while (i < 10) {
    const mesh = box.clone();
    // changes made to position and rotation to not effect original
    //const rad = Math.PI * 2 * (i / 10);
    
    const x = i - 1;
    const z = THREE.MathUtils.randFloatSpread(randomSeedSphere);
    const sizeX = THREE.MathUtils.randFloatSpread(randomSizeSphere);
    const sizeY = THREE.MathUtils.randFloatSpread(randomSizeSphere);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    mesh.material = new THREE.MeshToonMaterial({ color: new THREE.Color(randomColor) });

    mesh.position.set(x, z, 0);
    mesh.scale.multiplyScalar(sizeX, sizeY); 
    mesh.lookAt(boxMesh.position);
    scene.add(mesh);
    i += 0.1;

    mesh.rotation.x += i + 0.1;
    mesh.rotation.y += i + 0.1;

    
  }
}



function createCloneIco(meshIco) {

  let i = -10;
  
  while (i < 10) {
    const meshIco = ico.clone();
    // changes made to position and rotation to not effect original
    const rad = Math.PI * 2 * (i / 10);
    const x = i - 1;
    const z = THREE.MathUtils.randFloatSpread(randomSeedIco);
    const sizeX = THREE.MathUtils.randFloatSpread(randomSizeIco);
    const sizeY = THREE.MathUtils.randFloatSpread(randomSizeIco);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    meshIco.material = new THREE.MeshToonMaterial({ color: new THREE.Color(randomColor) });

    meshIco.position.set(x, z, 0);
    meshIco.scale.multiplyScalar(sizeX, sizeY); 
    meshIco.lookAt(ico.position);
    scene.add(meshIco);
    i += 0.1;

    meshIco.rotation.x += i + 0.1;
    meshIco.rotation.y += i + 0.1;
  }
}

createCloneSphere(boxMesh);
createCloneIco(icoMesh);


// Add the cube to the scene
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

scene.add(line);
scene.add(circle);
//scene.add(sphere);
scene.add(sphereSmall);
scene.add(ico);
scene.add(box);

scene.add(boxMesh);
scene.add(icoMesh);


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
  //sphere.rotation.x += 0.005;
  //sphere.rotation.y += 0.01;

  //ico.position.x = 1;
  //ico.position.y = -1;
  //ico.position.z = 1;

  ico.rotation.x += 0.01;
  ico.rotation.y += 0.01;


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
