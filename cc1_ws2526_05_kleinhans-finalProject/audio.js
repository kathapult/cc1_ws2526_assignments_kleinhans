import * as THREE from "three";
import { camera, scene, spotLight, lampLight, pointLight1, pointLight2, ambientLight } from "./scene.js";

let sound;
let analyser;
let listener;

export function initAudio(camera) {

  listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("public/audio/set.mov", (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.6);
  });

  analyser = new THREE.AudioAnalyser(sound, 64);
}

export function playAudio() {
  if (!sound.isPlaying) {
    sound.play();
  }
}

export function getAudioData() {
  if (!analyser) return 0;
  return analyser.getAverageFrequency();
}