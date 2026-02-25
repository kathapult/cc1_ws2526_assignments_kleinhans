import { scene, ambientLight, camera, discoBall, spotLight, pointLight1 } from "./scene.js";
import { gsap } from "gsap";

let currentMode = "home";

export function setMode(newMode) {

  if (currentMode === newMode) return;
  currentMode = newMode;

  if (newMode === "lineup") enterLineup();
  if (newMode === "home") enterHome();
}


function enterLineup() {

    console.log('enter LineUp')

    gsap.to(ambientLight, {
    intensity: 0.8,
    duration: 1
    });

    scene.fog.far = 60;

    gsap.to(camera.position, {
    y: 25,
    z: 60,
    duration: 2,
    ease: "power2.inOut"
    });

  if (discoBall) {
    gsap.to(discoBall.position, {
      y: 10,
      duration: 2
    });
  }

  gsap.to(spotLight, {
    intensity: 3000,
    duration: 1.5
  });

  pointLight1.color.set(0xff00ff);
  gsap.to(pointLight2.color, {
  r: 1,
  g: 0,
  b: 1,
  duration: 1
    });

    setTimeout(() => {
    document.body.dataset.mode = "lineup";
    }, 4000);
}

