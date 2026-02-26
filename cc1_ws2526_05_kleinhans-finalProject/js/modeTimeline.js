import { gsap } from "gsap";
import { playAudio, stopAudio } from "./audio.js";
import { showLineupArtists } from "./scene.js";

let masterTL;
let deps;



export function initModeTimeline(dependencies) {
  deps = dependencies;

  masterTL = gsap.timeline({ paused: true });

  
  // --------------------------------------------------
  // HOME Snapshot
  // --------------------------------------------------
  masterTL.addLabel("home", 0);
  masterTL.set(deps.camera.position, { x: 0, y: 0, z: 50 }, 0);
  masterTL.set(deps.djPult, { y: 0 }, 0);
  masterTL.set(deps.ambientLight, { intensity: 0.5 }, 0);
  masterTL.set(deps.spotLight, { intensity: 500 }, 0);
  if (deps.lampLight) masterTL.set(deps.lampLight, { intensity: 1 }, 0);
  masterTL.set(deps.pointLight1, { intensity: deps.pointLight1.userData.baseIntensity }, 0);
  masterTL.set(deps.pointLight1.color, { r: 1, g: 1, b: 1 }, 0);
  masterTL.set(deps.pointLight2, { intensity: deps.pointLight2.userData.baseIntensity }, 0);
  masterTL.set(deps.pointLight2.color, { r: 1, g: 1, b: 1 }, 0);
  if (deps.pointLight1.userData.shell) deps.pointLight1.userData.shell.scale.set(1, 1, 1);
  if (deps.scene.fog) deps.scene.fog.far = 100;
  deps.motion.featherRotationFactor = 1;
  deps.motion.featherWindFactor = 1;

  // --------------------------------------------------
  // LINEUP Snapshot
  // --------------------------------------------------
  masterTL.addLabel("lineup", 1);

  masterTL.to(deps.camera.position, { x: 0, y: 20, z: 60, duration: 2, ease: "power2.inOut" }, 1);
  masterTL.to(deps.djPult, { y: 400, duration: 1.5, ease: "power2.inOut" }, 1);
  masterTL.to(deps.ambientLight, { intensity: 20, duration: 1.5 }, 1);
  masterTL.to(deps.spotLight, { intensity: 300, duration: 1.5 }, 1);
  if (deps.lampLight) masterTL.to(deps.lampLight, { intensity: 40, duration: 1.5 }, 1);
  masterTL.to(deps.pointLight1.color, { r: 1, g: 0, b: 1, duration: 1.5 }, 1);
  masterTL.to(deps.pointLight2.color, { r: 1, g: 0, b: 1, duration: 1.5 }, 1);
  if (deps.pointLight1.userData.shell) masterTL.to(deps.pointLight1.userData.shell.scale, { x: 2, y: 2, z: 2, duration: 1.5 }, 1);
  masterTL.call(() => { if (deps.discoBall) deps.spotLight.target.position.copy(deps.discoBall.position); }, null, 1);

  // Feather Werte sofort setzen
  masterTL.set(deps.motion, { featherRotationFactor: 1, featherWindFactor: 1 }, 1);

  // Call: Lineup Bilder anzeigen **erst hier**
  masterTL.call(() => {
    showLineupArtists();
  }, null, 2); // 2 Sekunden nach Label "lineup"

  // --------------------------------------------------
  // GALLERY Snapshot
  // --------------------------------------------------
  masterTL.addLabel("gallery", 2);
  masterTL.to(deps.camera.position, { x: 0, y: 10, z: 40, duration: 2, ease: "power2.inOut" }, 2);
  masterTL.to(deps.djPult, { y: 280, duration: 1.5, ease: "power2.inOut" }, 2);
  masterTL.to(deps.ambientLight, { intensity: 5, duration: 1.5 }, 2);
  masterTL.to(deps.spotLight, { intensity: 200, duration: 1.5 }, 2);
  if (deps.lampLight) masterTL.to(deps.lampLight, { intensity: 10, duration: 1.5 }, 2);
  masterTL.to(deps.pointLight1.color, { r: 0.3, g: 0, b: 0.6, duration: 1.5 }, 2);
  masterTL.to(deps.pointLight2.color, { r: 0.1, g: 0.1, b: 0.4, duration: 1.5 }, 2);
  if (deps.scene.fog) deps.scene.fog.far = 50;
  masterTL.set(deps.motion, { featherRotationFactor: 0.2, featherWindFactor: 0.2 }, 2);

  // Start auf Home
  masterTL.progress(0);
}

// --------------------------------------------------
// Mode UI + Feather + Audio
// --------------------------------------------------
function onModeChange(mode) {
  document.body.dataset.mode = mode;

  const lineupSection = document.querySelector(".lineup-section");
  const gallerySection = document.querySelector(".gallery-section");

  if (lineupSection) {
    lineupSection.style.opacity = mode === "lineup" ? 1 : 0;
    lineupSection.style.pointerEvents = mode === "lineup" ? "auto" : "none";
  }

  if (gallerySection) {
    gallerySection.style.opacity = mode === "gallery" ? 1 : 0;
    gallerySection.style.pointerEvents = mode === "gallery" ? "auto" : "none";
  }

  if (mode === "lineup") {
    deps.motion.featherRotationFactor = 1;
    deps.motion.featherWindFactor = 1;
  } else if (mode === "gallery") {
    deps.motion.featherRotationFactor = 0.2;
    deps.motion.featherWindFactor = 0.2;
  } else {
    deps.motion.featherRotationFactor = 1;
    deps.motion.featherWindFactor = 1;
  }

  if (mode === "lineup") playAudio();
  else stopAudio();
}

// --------------------------------------------------
// Sanfter Moduswechsel garantiert exakt
// --------------------------------------------------
export function goToMode(mode) {
  if (!masterTL) return;
  if (document.body.dataset.mode === mode) return;

  deps.setVisualMode(mode);

  onModeChange(mode);

  const targetPositions = {
    home: { x: 0, y: 0, z: 50 },
    lineup: { x: 0, y: 20, z: 60 },
    gallery: { x: 0, y: 10, z: 40 },
  };

  gsap.to(deps.camera.position, {
    x: targetPositions[mode].x,
    y: targetPositions[mode].y,
    z: targetPositions[mode].z,
    duration: 2,
    ease: "power2.inOut",
    onComplete: () => {
      deps.camera.position.set(
        targetPositions[mode].x,
        targetPositions[mode].y,
        targetPositions[mode].z
      );
    }
  });

  const lightTargets = {
    home: 0.5,
    lineup: 20,
    gallery: 5,
  };

  gsap.to(deps.ambientLight, {
    intensity: lightTargets[mode],
    duration: 2
  });
}