import * as THREE from "three";
import { createNoise2D } from 'simplex-noise';

console.log(THREE);

//Submit a text-based program and its result for each of the following instruction. 
// Try to include into the programming some algorithmic thinking, meaning a structured approach.

// 1. SCENE
const scene = new THREE.Scene();

// 2. CAMERA
/*const fov = 80;
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.5;
const far = 24;
//const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const camera = new THREE.OrthographicCamera(fov, aspect, near, far);
camera.position.z = 10;*/
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera( 
  -aspect * 5,
   aspect * 5,
   5,
  -5,
  0.1,
  100);
camera.position.z = 10;

// 3. RENDERER
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. GEOMETRY
const geometry = new THREE.CircleGeometry( 1, 40 );
const geoBody = new THREE.CircleGeometry( 1.6, 32 );
const geoEye = new THREE.CircleGeometry( 0.8, 32 );
const geoPupil = new THREE.CircleGeometry( 0.3, 22 );
const geoWattles = new THREE.CircleGeometry( 0.1, 22 );
const geoComp = new THREE.CircleGeometry( 0.5, 12 );
const shapeBeak = new THREE.Shape();
shapeBeak.moveTo(0, 0);
shapeBeak.lineTo(-0.8, 0.8);
shapeBeak.lineTo(0.8, 0.8);
shapeBeak.closePath();
const triangle = new THREE.ShapeGeometry(shapeBeak);


const positionAttribute = geometry.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i ));
}
const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

// 5. MATERIAL
const material = new THREE.MeshBasicMaterial( { color: 0x929699 } );
const materialOrange = new THREE.MeshBasicMaterial( { color: 0x921499 } );
const materialEye = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const materialBody = new THREE.MeshNormalMaterial();
const black = new THREE.MeshBasicMaterial( { color: 0x000000 } );

// 6. MESH
const circles = []; 
const cols = Math.floor(window.innerWidth / 2);      
const rows = Math.floor(window.innerHeight / 2);      
const spacing = 5;
let counter = 0;

for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    const circle = new THREE.LineLoop(outlineGeometry, material);
    const box = new THREE.Mesh(geoBody, materialBody);
    const eye = new THREE.Mesh(geoEye, materialEye);
    const eyeL = eye.clone();
    const eyeR = eye.clone();
    const pupil = new THREE.Mesh(geoPupil, black);
    const pupilL = pupil.clone();
    const pupilR = pupil.clone();
    const beak = new THREE.Mesh(triangle, materialOrange);
    const wattles = new THREE.Mesh(geoWattles, materialOrange);
    const wattlesL = wattles.clone();
    const wattlesR = wattles.clone();
    const comp= new THREE.Mesh(geoComp, materialOrange);
    const comp1 = comp.clone();
    const comp2 = comp.clone();

    circle.position.x = (x - cols / 2) * spacing;
    circle.position.y = (y - rows / 2) * spacing;
    box.position.x = (x - cols / 2) * spacing;
    box.position.y = (y - rows / 2) * spacing;
    
     //z-index
    eyeL.position.z = 1;
    eyeR.position.z = 1;
    beak.position.z = 1;
    pupilL.position.z = 2;
    pupilR.position.z = 2;
    wattlesL.position.z = 2;
    wattlesR.position.z = 2;

    eyeL.scale.x = 0.7;
    eyeL.scale.y = 0.7;
    wattlesR.scale.y = 2;
    wattlesL.scale.y = 2;
    comp1.scale.y = 2;
    comp2.scale.y = 2;
    eyeL.position.x = (x - cols / 2) * spacing + 0.5;
    eyeL.position.y = (y - rows / 2) * spacing + 1.2;
    eyeR.position.x = (x - cols / 2) * spacing - 0.5;
    eyeR.position.y = (y - rows / 2) * spacing + 1.2;
    pupilL.position.x = (x - cols / 2) * spacing - 0.5;
    pupilL.position.y = (y - rows / 2) * spacing + 1.2;
    pupilR.position.x = (x - cols / 2) * spacing + 0.5;
    pupilR.position.y = (y - rows / 2) * spacing + 1.2;
    wattlesR.position.x = (x - cols / 2) * spacing - 0.2;
    wattlesR.position.y = (x - cols / 2) * spacing - 0.8;
    wattlesL.position.x = (x - cols / 2) * spacing + 0.2;
    wattlesL.position.y = (x - cols / 2) * spacing - 0.8;
    comp1.position.x = (x - cols / 2) * spacing - 0.2;
    comp1.position.y = (x - cols / 2) * spacing + 1.4;
    comp2.position.x = (x - cols / 2) * spacing + 0.2;
    comp2.position.y = (x - cols / 2) * spacing + 1.4;
 
    
    eyeR.scale.x = 0.7;
    eyeR.scale.y = 0.7;
    beak.position.x = (x - cols / 2) * spacing ;
    beak.position.y = (y - rows / 2) * spacing - 0.5;

    beak.scale.y = 1.6;
   
   

    const baseScale = Math.max(4, 1 - counter * 0.03);

    circle.userData = {
      baseScale,
      scale: baseScale,
      dir: 1,
      speed: 0.005
    };

     box.userData = {
      baseScale,
      scale: baseScale,
      dir: 1,
      speed: 0.005
    };

    scene.add(circle);
    scene.add(box);
    scene.add(eyeL, eyeR);
    scene.add(pupilL, pupilR);
    scene.add(beak);
    scene.add(wattlesR, wattlesL);
    scene.add(comp1, comp2);
    circles.push(circle);
    //circles.push(box);

    counter++;
  }
}

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
  const { width, height } = getVisibleSize(camera);
  
  circles.forEach(circle => {
    const data = circle.userData;
    
    data.scale += data.speed * data.dir;
    circle.scale.setScalar(data.scale);
    const radius = geometry.parameters.radius * data.scale;


    if (radius >= width / rows * 10 || radius >= height / cols * 10) {
      data.dir = -1;
    }

    if (radius <= 0.2) {
      data.dir = 1;
    }

  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();


// 8. HANDLE WINDOW RESIZE
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);
