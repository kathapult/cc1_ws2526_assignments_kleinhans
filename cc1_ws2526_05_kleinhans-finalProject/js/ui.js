import * as THREE from "three";
import { Chicken } from "./chicken.js";

const canvas = document.getElementById("uiCanvas");

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1,
  10
);

camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const cursorChicken = new Chicken({ spacing: 60, scale: 1 });
scene.add(cursorChicken.group);

let mouse = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX - window.innerWidth / 2;
  mouse.y = -(e.clientY - window.innerHeight / 2);

  cursorChicken.group.position.set(mouse.x, mouse.y, 0);
});

window.addEventListener("click", () => {

  cursorChicken.group.scale.set(1.6, 1.2, 1);

  setTimeout(() => {
    cursorChicken.group.scale.set(1, 1, 1);
  }, 100);

});

// ---- resize

function resizeUI() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;

  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeUI);
resizeUI();

function animate() {
  requestAnimationFrame(animate);

  // Pupillenbewegung
  const maxOffset = 3;

  cursorChicken.pupilL.position.x =
    cursorChicken.basePupilLPos.x + (mouse.x / window.innerWidth) * maxOffset;

  cursorChicken.pupilL.position.y =
    cursorChicken.basePupilLPos.y + (mouse.y / window.innerHeight) * maxOffset;

  cursorChicken.pupilR.position.x =
    cursorChicken.basePupilRPos.x + (mouse.x / window.innerWidth) * maxOffset;

  cursorChicken.pupilR.position.y =
    cursorChicken.basePupilRPos.y + (mouse.y / window.innerHeight) * maxOffset;

  renderer.render(scene, camera);
}

animate();