import * as THREE from "three";
import { camera, scene, djPult, discoBall, spotLight, lampLight, pointLight1, pointLight2, ambientLight } from "./scene.js";
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

    gsap.to(djPult, {
    y: 300,        
    duration: 1.5,
    ease: "power2.inOut"
    });

    gsap.to(camera.position, {
    x: 0,
    y: 20,
    z: 60,
    duration: 2,
    ease: "power2.inOut"
    });

    gsap.to(ambientLight, {
    intensity: 20,
    duration: 1
    });

    gsap.to(lampLight, {
    intensity: 40,
    duration: 1
    });

    // scene.fog = new THREE.Fog(0x000000, 10, 100);
    // scene.fog.far = 20;

  if (discoBall) {
    gsap.to(discoBall.position, {
      //y: 25,
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

