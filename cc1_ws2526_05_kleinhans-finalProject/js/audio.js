import * as THREE from "three";

let sound;
let analyser;
let listener;

export function initAudio(camera) {

  listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);

  const audioURL = new URL("../assets/audio/set.mov", import.meta.url).href;
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load(audioURL, (buffer) => {
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

export function stopAudio() {
  if (sound && sound.isPlaying) {
    sound.stop(); // Audio komplett stoppen
  }
}

export function pauseAudio() {
  if (sound && sound.isPlaying) {
    sound.pause();
  }
}