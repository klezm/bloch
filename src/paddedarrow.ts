import { acos, atan2, pi } from 'mathjs';
import { ArrowHelper, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three';
import { createArrow, createVec } from './utils';

const SPHERE_RADIUS = 0.2;

function createCone(
  x: number,
  y: number,
  z: number,
  visible: boolean = false,
  rad: number = SPHERE_RADIUS,
  segments: number = 10,
  hex: number = 0xffff00
): Object3D {
  const geometry = new SphereGeometry(rad, segments, segments);
  const material = new MeshBasicMaterial({ visible: visible, color: hex });
  const coneContainer = new Object3D();
  const cone = new Mesh(geometry, material);
  coneContainer.add(cone);
  return coneContainer;
}

// Arrow that has a larger, invisible region sorrounding its tip to make it easier for the user to click.
export class PaddedArrow {
  private container: Object3D;
  // private visibleArrow: ArrowHelper;
  private visibleArrow;
  private visibleCone;
  private invisibleCone: Object3D;

  constructor() {
    this.container = new Object3D();
    // this.visibleArrow = createArrow(1, 0, 0);
    this.visibleArrow = createVec(1, 0, 0);

    this.visibleCone = createCone(1, 0, 0, true, 0.05, 20);
    this.visibleCone.rotateZ(-pi / 2);
    this.visibleCone.position.set(1.1 - SPHERE_RADIUS / 2, 0, 0);

    this.invisibleCone = createCone(1, 0, 0);
    this.invisibleCone.rotateZ(-pi / 2);
    this.invisibleCone.position.set(1 - SPHERE_RADIUS / 2, 0, 0);
    this.container.add(this.visibleArrow, this.visibleCone, this.invisibleCone);
    // this.container.add(...this.visibleArrow);
    // this.container.add(this.invisibleCone);
  }

  setDirection(dir: Vector3) {
    dir = dir.clone().normalize();
    const theta = acos(dir.z);
    const phi = atan2(dir.y, dir.x);
    this.container.rotation.set(0, 0, phi);
    this.container.rotateY(theta - pi / 2);
  }

  getDragZone() {
    return this.invisibleCone.children[0];
  }

  getContainer() {
    return this.container;
  }

  setColor(hex: number) {
    this.visibleArrow.setColor(hex);
  }
}

export function createPaddedArrow(x: number, y: number, z: number): PaddedArrow {
  const paddedArrow = new PaddedArrow();
  paddedArrow.setDirection(new Vector3(x, y, z));
  return paddedArrow;
}
