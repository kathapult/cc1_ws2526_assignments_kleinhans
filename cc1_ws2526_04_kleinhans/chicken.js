import * as THREE from 'three';

export class Chicken {
  constructor({
    spacing = 1,
    patternIndex = 0,
    scale = 1,
    yOffset = 0,
  } = {}) {

    this.group = new THREE.Group();

    // ---------- SIZES ----------
    const bodySize = spacing / 4;
    const wattlesSize = spacing / 40;
    const compSize = spacing / 12;
    const beakSize = spacing / 6;
    const eyeSize = spacing / 7.5;
    const pupilSize = eyeSize / 3;

    // ---------- GEOMETRY ----------
    const geoBody = new THREE.CircleGeometry(bodySize, 32);
    const geoEye = new THREE.CircleGeometry(eyeSize, 32);
    const geoPupil = new THREE.CircleGeometry(pupilSize, 22);
    const geoWattles = new THREE.CircleGeometry(wattlesSize, 22);
    const geoComp = new THREE.CircleGeometry(compSize, 22);

    const shapeBeak = new THREE.Shape();
    shapeBeak.moveTo(0, 0);
    shapeBeak.lineTo(-beakSize, beakSize);
    shapeBeak.lineTo(beakSize, beakSize);
    shapeBeak.closePath();
    const geoBeak = new THREE.ShapeGeometry(shapeBeak);

    // ---------- MATERIALS ----------
    
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x8a7c59 });
    const faceMaterial = new THREE.MeshBasicMaterial({ color: 0xeca453});
    const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xD0CBBD });
    const black = new THREE.MeshBasicMaterial({ color: 0x000000 });

    
    // ---------- MESHES ----------
    const body = new THREE.Mesh(geoBody, bodyMaterial);
    const eyeL = new THREE.Mesh(geoEye, eyeWhite);
    const eyeR = eyeL.clone();
    const pupilL = new THREE.Mesh(geoPupil, bodyMaterial);
    const pupilR = pupilL.clone();
    const beak = new THREE.Mesh(geoBeak, faceMaterial);
    const wattlesL = new THREE.Mesh(geoWattles, faceMaterial);
    const wattlesR = wattlesL.clone();
    const comp1 = new THREE.Mesh(geoComp, faceMaterial);
    const comp2 = comp1.clone();

    // ---------- POSITIONING ----------
    const eyeOffsetX = bodySize * 0.5;
    const eyeOffsetY = bodySize * 0.5;

    eyeL.position.set(-eyeOffsetX, eyeOffsetY, 0.04);
    eyeR.position.set( eyeOffsetX, eyeOffsetY, 0.04);
    pupilL.position.copy(eyeL.position).setZ(0.06);
    pupilR.position.copy(eyeR.position).setZ(0.06);

    beak.position.set(0, -bodySize * 0.5, 0.02);
    beak.scale.y = 1.6;

    const wattleOffsetX = bodySize * 0.2;
    const wattleOffsetY = bodySize * 0.6;

    wattlesL.position.set( wattleOffsetX, -wattleOffsetY, 0.02);
    wattlesR.position.set(-wattleOffsetX, -wattleOffsetY, 0.02);
    wattlesL.scale.y = 1.8;
    wattlesR.scale.y = 1.8;

    const compOffsetX = bodySize * 0.25;
    const compOffsetY = bodySize * 0.9;

    comp1.position.set(-compOffsetX, compOffsetY, 0.02);
    comp2.position.set( compOffsetX, compOffsetY, 0.02);
    comp1.scale.y = comp2.scale.y = 2;

    this.group.position.y = yOffset;

    // ---------- GROUP ----------
    this.group.add(
      body,
      eyeL, eyeR,
      pupilL, pupilR,
      beak,
      wattlesL, wattlesR,
      comp1, comp2
    );

    this.group.scale.setScalar(scale);
  }
}
