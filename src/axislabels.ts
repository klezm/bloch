import * as THREE from 'three';
import { createText } from './utils';

export class AxisLabels {
  // TODO: https://threejs.org/docs/index.html#api/en/objects/Sprite
  private parent: THREE.Object3D;
  private xLabel: THREE.Mesh;
  private yLabel: THREE.Mesh;
  private zLabel: THREE.Mesh;
  private basis0Label: THREE.Mesh;
  private basis1Label: THREE.Mesh;
  private plusLabel: THREE.Mesh;
  private minusLabel: THREE.Mesh;
  private iLabel: THREE.Mesh;
  private iminusLabel: THREE.Mesh;

  constructor(parent: THREE.Object3D, textLayer: THREE.Object3D) {
    this.parent = parent;
    this.xLabel = createText('x');
    this.yLabel = createText('y');
    this.zLabel = createText('z');
    this.basis0Label = createText('|0⟩');
    this.basis1Label = createText('|1⟩');
    this.plusLabel = createText('|+⟩');
    this.minusLabel = createText('|-⟩');
    this.iLabel = createText('|i⟩');
    this.iminusLabel = createText('|-i⟩');
    textLayer.add(this.xLabel);
    textLayer.add(this.yLabel);
    textLayer.add(this.zLabel);
    textLayer.add(this.basis0Label);
    textLayer.add(this.basis1Label);
    textLayer.add(this.plusLabel);
    textLayer.add(this.minusLabel);
    textLayer.add(this.iLabel);
    textLayer.add(this.iminusLabel);
  }

  /**
   * set shift to offset all labels from the center.
   */
  align(shift?: boolean) {
    if (shift === undefined) {
      this.alignLabelToAxis(new THREE.Vector3(1, 0, 0), this.xLabel);
      this.alignLabelToAxis(new THREE.Vector3(0, 1, 0), this.yLabel);
      this.alignLabelToAxis(new THREE.Vector3(0, 0, 1), this.zLabel);
      this.alignLabelToAxis(new THREE.Vector3(0, 0, 1.15), this.basis0Label);
      this.alignLabelToAxis(new THREE.Vector3(0, 0, -1.15), this.basis1Label);
      this.alignLabelToAxis(new THREE.Vector3(1.25, 0, 0), this.plusLabel);
      this.alignLabelToAxis(new THREE.Vector3(-1.15, 0, 0), this.minusLabel);
      this.alignLabelToAxis(new THREE.Vector3(0, 1.15, 0), this.iLabel);
      this.alignLabelToAxis(new THREE.Vector3(0, -1.15, 0), this.iminusLabel);
    } else {
      this.alignLabelToAxis(new THREE.Vector3(1, 0.1, 0.05), this.xLabel);
      this.alignLabelToAxis(new THREE.Vector3(-0.1, 1, 0.05), this.yLabel);
      this.alignLabelToAxis(new THREE.Vector3(-0.05, 0.1, 1), this.zLabel);
      this.alignLabelToAxis(new THREE.Vector3(-0.07, -0.07, 1.15), this.basis0Label);
      this.alignLabelToAxis(new THREE.Vector3(0.07, 0.07, -1.15), this.basis1Label);
      this.alignLabelToAxis(new THREE.Vector3(1.25, -0.07, 0.07), this.plusLabel);
      this.alignLabelToAxis(new THREE.Vector3(-1.15, 0.07, -0.07), this.minusLabel);
      this.alignLabelToAxis(new THREE.Vector3(0.07, 1.15, 0.07), this.iLabel);
      this.alignLabelToAxis(new THREE.Vector3(-0.07, -1.15, -0.07), this.iminusLabel);
    }
  }

  private alignLabelToAxis(axis: THREE.Vector3, label: THREE.Mesh) {
    const worldVector3 = this.parent.localToWorld(axis);
    label.position.set(worldVector3.x, worldVector3.y, 0);
  }
}
