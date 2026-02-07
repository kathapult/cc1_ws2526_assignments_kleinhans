import * as THREE from "three";
import { createNoise2D } from 'simplex-noise';

// 1. SCENE
const scene = new THREE.Scene();

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

// 3. RENDERER
const canvas = document.querySelector("#canvasThree");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. GEOMETRY
const spacing = window.innerWidth / 800;
const bodySize = spacing / 4;
const wattlesSize = spacing / 40;
const compSize = spacing / 12;
const beakSize = spacing / 6; 
const eyeSize = spacing / 5;
const pupilSize = eyeSize / 3;  

const geoCircle = new THREE.CircleGeometry( 1.4, 40 );
const geoBody = new THREE.CircleGeometry( bodySize, 32 );
const geoEye = new THREE.CircleGeometry( eyeSize, 32 );
const geoPupil = new THREE.CircleGeometry( pupilSize, 22 );
const geoWattles = new THREE.CircleGeometry( wattlesSize, 22 );
const geoComp = new THREE.CircleGeometry( compSize, 12 );
const shapeBeak = new THREE.Shape();
shapeBeak.moveTo(0, 0);
shapeBeak.lineTo(-beakSize, beakSize);
shapeBeak.lineTo(beakSize, beakSize);
shapeBeak.closePath();
const triangle = new THREE.ShapeGeometry(shapeBeak);

// outline circles
const positionAttribute =  geoCircle.getAttribute('position');
const points = [];
for (let i = 1; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i ));
}
const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);



// 5. MATERIAL
const materialCircle = new THREE.MeshBasicMaterial( { color: 0xffa500 } );
const materialEye = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const black = new THREE.MeshBasicMaterial( { color: 0x000000 } );
const bodyMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x248ab5 }), // blue
  new THREE.MeshBasicMaterial({ color: 0xffa500 }), // orange
  new THREE.MeshBasicMaterial({ color: 0x921499 })  // violet
];
const faceMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x921499 }),  // violet
  new THREE.MeshBasicMaterial({ color: 0x248ab5 }), // blue
  new THREE.MeshBasicMaterial({ color: 0xffa500 }) // orange
  
];

// 6. MESH
const circles = []; 
const cols = Math.floor((aspect * 10) / spacing +2);
const rows = Math.floor(10 / spacing + 1.5 ); 
let counter = 0;

for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {

    const baseX = (x - cols / 2) * spacing;
    const baseY = (y - rows / 2) * spacing;

    const pattern = (x + y) % 3;
    const bodyMaterial = bodyMaterials[pattern];
    const faceMaterial = faceMaterials[pattern];
    const circle = new THREE.LineLoop(outlineGeometry, materialCircle);
    let body = new THREE.Mesh(geoBody, bodyMaterial);
    const eye = new THREE.Mesh(geoEye, materialEye);
    const eyeL = eye.clone();
    const eyeR = eye.clone();
    const pupil = new THREE.Mesh(geoPupil, black);
    const pupilL = pupil.clone();
    const pupilR = pupil.clone();
    let beak = new THREE.Mesh(triangle, faceMaterial);
    let wattles = new THREE.Mesh(geoWattles, faceMaterial);
    const wattlesL = wattles.clone();
    const wattlesR = wattles.clone();
    let comp= new THREE.Mesh(geoComp, faceMaterial);
    const comp1 = comp.clone();
    const comp2 = comp.clone();

    circle.position.x = (x - cols / 2) * spacing;
    circle.position.y = (y - rows / 2) * spacing;
    body.position.x = (x - cols / 2) * spacing;
    body.position.y = (y - rows / 2) * spacing;
    
     //z-index
    beak.position.z = 1;
    eyeL.position.z = 2;
    eyeR.position.z = 2;
    wattlesL.position.z = 2;
    wattlesR.position.z = 2;
    pupilL.position.z = 3;
    pupilR.position.z = 3;
    comp1.scale.y = 3;
    comp2.scale.y = 3;


    eyeL.scale.x = 0.7;
    eyeL.scale.y = 0.7;
    wattlesR.scale.y = 2;
    wattlesL.scale.y = 2;
    comp1.scale.y = 2;
    comp2.scale.y = 2;

    const eyeOffsetX = bodySize * 0.5;
    const eyeOffsetY = bodySize * 0.5;

    eyeL.position.x = baseX + eyeOffsetX;
    eyeL.position.y = baseY + eyeOffsetY;
    eyeR.position.x = baseX - eyeOffsetX;
    eyeR.position.y = baseY + eyeOffsetY;
    pupilL.position.x = baseX - eyeOffsetX;
    pupilL.position.y = baseY + eyeOffsetY;
    pupilR.position.x = baseX + eyeOffsetX;
    pupilR.position.y = baseY + eyeOffsetY;
    
    const wattleOffsetX = bodySize * 0.2;
    const wattleOffsetY = bodySize * 0.6;

    wattlesR.position.x = baseX - wattleOffsetX;
    wattlesL.position.x = baseX + wattleOffsetX;
    wattlesR.position.y = baseY - wattleOffsetY;
    wattlesL.position.y = baseY - wattleOffsetY;

    const compOffsetX = bodySize * 0.25;
    const compOffsetY = bodySize * 0.9;

    comp1.position.x = baseX - compOffsetX;
    comp2.position.x = baseX + compOffsetX;
    comp1.position.y = baseY + compOffsetY;
    comp2.position.y = baseY + compOffsetY;
   
    eyeR.scale.x = 0.7;
    eyeR.scale.y = 0.7;
    beak.position.x = baseX;
    beak.position.y = baseY - bodySize * 0.5;

    beak.scale.y = 1.6;
   
   

    const baseScale = Math.max(1, 1 - counter * 0.01);

    circle.userData = {
      baseScale,
      scale: baseScale,
      dir: 1,
      speed: 0.001
    };

     body.userData = {
      baseScale,
      scale: baseScale,
      dir: 1,
      speed: 0.001
    };

    scene.add(circle);
    scene.add(body);
    scene.add(eyeL, eyeR);
    scene.add(pupilL, pupilR);
    scene.add(beak);
    scene.add(wattlesR, wattlesL);
    scene.add(comp1, comp2);
    circles.push(circle);
    //circles.push(body);

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
  const maxRadius = spacing * 2.4; // max
  const minRadius = 1;           // min

  circles.forEach(circle => {
    const data = circle.userData;

    // Skala ändern
    data.scale += data.speed * data.dir;
    circle.scale.setScalar(data.scale);

    const radius = geoCircle.parameters.radius * data.scale;

    // Richtung umkehren
    if (radius >= maxRadius) {
      data.dir = -1; 
    }

    if (radius <= minRadius) {
      data.dir = 1;  
    }
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();


// 8. HANDLE WINDOW RESIZE
function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  // Orthographic-Kamera neu setzen
  camera.left = -aspect * 5;
  camera.right = aspect * 5;
  camera.top = 5;
  camera.bottom = -5;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);
