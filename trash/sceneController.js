import { gsap } from "gsap";
import { playAudio, stopAudio, pauseAudio } from "./audio.js";

let deps = {};

let lineupTL;
let galleryTL;
let currentMode = "home";

// --------------------------------------------------
// INIT (wird einmal aus scene.js aufgerufen)
// --------------------------------------------------
export function initSceneController(dependencies) {
  deps = dependencies;
}

// --------------------------------------------------
// MODE SWITCH
// --------------------------------------------------
export function setMode(mode) {

  if (mode === currentMode) return;

  currentMode = mode;

  deps.setVisualMode(mode); // wichtig für deinen Render Loop

  resetUI(mode);

  switch(mode) {
    case "home":
      enterHome();
      break;
    case "lineup":
      enterLineup();
      break;
    case "gallery":
      enterGallery();
      break;
  }
}

// --------------------------------------------------
// RESET UI
// --------------------------------------------------
function resetUI(targetMode) {

  const lineupSection = document.querySelector(".lineup-section");
  const gallerySection = document.querySelector(".gallery-section");

  if (lineupSection && targetMode !== "lineup") {
    lineupSection.style.opacity = 0;
    lineupSection.style.pointerEvents = "none";
  }

  if (gallerySection && targetMode !== "gallery") {
    gallerySection.style.opacity = 0;
    gallerySection.style.pointerEvents = "none";
  }

  if (lineupTL && targetMode !== "lineup") lineupTL.pause(0);
  if (galleryTL && targetMode !== "gallery") galleryTL.pause(0);

  resetLights();

  deps.motion.featherRotationFactor = 1;
  deps.motion.featherWindFactor = 1;

  document.body.dataset.mode = targetMode === "home" ? "home" : "";
}

// --------------------------------------------------
// LIGHT RESET
// --------------------------------------------------
function resetLights() {

  deps.ambientLight.intensity = 0.5;

  if (deps.lampLight) deps.lampLight.intensity = 1;
  if (deps.spotLight) deps.spotLight.intensity = 500;

  deps.pointLight1.intensity = deps.pointLight1.userData.baseIntensity;
  deps.pointLight1.color.set(0xffffff);

  if (deps.pointLight1.userData.shell) {
    deps.pointLight1.userData.shell.scale.set(1,1,1);
  }

  deps.pointLight2.intensity = deps.pointLight2.userData.baseIntensity;
  deps.pointLight2.color.set(0xffffff);
}

// --------------------------------------------------
// LINEUP MODE
// --------------------------------------------------
function enterLineup() {

  playAudio();

  if (!lineupTL) {

    lineupTL = gsap.timeline({ paused: true });

    gsap.to(deps.motion, {
      featherRotationFactor: 1,
      featherWindFactor: 1,
      duration: 2,
      ease: "power2.out"
    });

    lineupTL.to(deps.djPult, {
      y: 400,
      duration: 1.3,
      ease: "power2.inOut"
    }, 0);

    lineupTL.to(deps.camera.position, {
      x: 0,
      y: 20,
      z: 60,
      duration: 2,
      ease: "power2.inOut"
    }, 0);

    lineupTL.to(deps.ambientLight, {
      intensity: 20,
      duration: 1
    }, 0);

    lineupTL.to(deps.lampLight, {
      intensity: 40,
      duration: 1
    }, 0);

    if (deps.discoBall) {
      lineupTL.to(deps.discoBall.position, {
        duration: 2
      }, 0.3);
    }

    lineupTL.to(deps.spotLight, {
      intensity: 3000,
      duration: 1.5
    }, 0.5);

    lineupTL.call(() => {
      deps.pointLight1.color.set(0xff00ff);
    }, null, 0.8);

    lineupTL.to(deps.pointLight2.color, {
      r: 1,
      g: 0,
      b: 1,
      duration: 1
    }, 0.8);

    lineupTL.call(() => {
      document.body.dataset.mode = "lineup";
    }, null, 2.5);
  }

  lineupTL.play();
}

// --------------------------------------------------
// GALLERY MODE
// --------------------------------------------------
function enterGallery() {

  pauseAudio();

  if (!galleryTL) {

    galleryTL = gsap.timeline({ paused: true });

    gsap.to(deps.motion, {
      featherRotationFactor: 0.2,
      featherWindFactor: 0.2,
      duration: 2,
      ease: "power2.out"
    });

    galleryTL.to(deps.camera.position, {
      x: 0,
      y: 10,
      z: 40,
      duration: 2,
      ease: "power2.inOut"
    }, 0);

    galleryTL.to(deps.djPult, {
      y: 280,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0);

    galleryTL.to(deps.ambientLight, {
      intensity: 5,
      duration: 1.5
    }, 0);

    galleryTL.to(deps.lampLight, {
      intensity: 10,
      duration: 1.5
    }, 0);

    galleryTL.to(deps.spotLight, {
      intensity: 200,
      duration: 1
    }, 0);

    galleryTL.to(deps.pointLight1.color, {
      r: 0.3,
      g: 0,
      b: 0.6,
      duration: 1.5
    }, 0.5);

    galleryTL.to(deps.pointLight2.color, {
      r: 0.1,
      g: 0.1,
      b: 0.4,
      duration: 1.5
    }, 0.5);

    galleryTL.call(() => {
      if (deps.scene.fog) {
        deps.scene.fog.far = 50;
      }
    }, null, 1);

    galleryTL.call(() => {
      document.body.dataset.mode = "gallery";
    }, null, 2);
  }

  galleryTL.play();
}

// --------------------------------------------------
// HOME MODE
// --------------------------------------------------
function applyHomeState() {

  // Camera
  gsap.set(deps.camera.position, {
    x: 0,
    y: 0,
    z: 50
  });

  // DJ Pult
  gsap.set(deps.djPult, {
    y: 0
  });

  // Lights
  deps.ambientLight.intensity = 0.5;

  if (deps.lampLight) deps.lampLight.intensity = 1;
  if (deps.spotLight) deps.spotLight.intensity = 500;

  deps.pointLight1.intensity = deps.pointLight1.userData.baseIntensity;
  deps.pointLight1.color.set(0xffffff);

  deps.pointLight2.intensity = deps.pointLight2.userData.baseIntensity;
  deps.pointLight2.color.set(0xffffff);

  if (deps.pointLight1.userData.shell) {
    deps.pointLight1.userData.shell.scale.set(1,1,1);
  }

  // Fog Reset
  if (deps.scene.fog) {
    deps.scene.fog.far = 100;
  }

  // Motion
  deps.motion.featherRotationFactor = 1;
  deps.motion.featherWindFactor = 1;
}

function enterHome() {

  stopAudio();

  if (lineupTL) lineupTL.reverse();
  if (galleryTL) galleryTL.reverse();

  document.body.dataset.mode = "home";
}