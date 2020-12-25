import {CaptureZone, DragCaptureZone, UserEvent} from './capturezone';
import {AxisLabels, createText} from './axislabels';
import * as THREE from 'three';
import {acos, cos, pi, sin} from 'mathjs';
import {intersectionsToMap, IntersectionMap, makeArc, makeArrow, polarToCaertesian} from './utils';
import { Object3D } from 'three';
import {RotationAxis} from './rotationaxis';

const helperRadius = 0.6;

function makeSphere(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const material = new THREE.MeshPhongMaterial( {color: 0x44aa88} );
  material.transparent = true;
  material.opacity = 0.2;
  return new THREE.Mesh(geometry, material);
}

function makaeDashedLine(endPoint: THREE.Vector3): THREE.Line {

  const gap = 0.025;
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), endPoint]);
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: gap,
    gapSize: gap,
  });

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export function makeBloch(canvas: HTMLCanvasElement) {

  const renderer = new THREE.WebGLRenderer({canvas});
  const cameraPos = new THREE.Vector3(0, 0, 2);

  // TODO: move to separate manager
  const captureZones: CaptureZone[] = [];
  let activeZone: CaptureZone = null;
  const events: UserEvent[] = [];

  const near = 0.1;
  const far = 5;
  const xExtent = 3;
  const yExtent = 1.5;
  const aspectRatio = xExtent / yExtent;
  const camera = new THREE.OrthographicCamera(-xExtent, xExtent, yExtent, -yExtent, near, far);
  camera.position.add(cameraPos);

  const scene = new THREE.Scene();

  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // light
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 2);
    scene.add(light);
  }

  const object = new THREE.Object3D();
  object.rotateX(-Math.PI/4);
  object.rotateZ(-(Math.PI/2 + Math.PI/4));
  const sphere = makeSphere();
  object.add(sphere);
  object.add(makeArrow(1, 0, 0));
  object.add(makeArrow(0, 1, 0));
  object.add(makeArrow(0, 0, 1));

  const rotationAxis = new RotationAxis(object);

  const phiLabel = createText("Φ", -1);
  object.add(phiLabel);

  const thetaLabel = createText("θ", -1);
  object.add(thetaLabel);

  let thetaArc: THREE.Line;
  let phiArc: THREE.Line;
  let phiLine: THREE.Line;

  const arrow = makeArrow(0, 0, 1);
  const dragZone = new DragCaptureZone([arrow.cone]);

  function setStateVectorToPoint(point: THREE.Vector3) {
    const theta = acos(point.dot(new THREE.Vector3(0, 0, 1)));
    let phi = acos((new THREE.Vector2(point.x, point.y).normalize()).dot(new THREE.Vector2(1, 0)));
    if (point.dot(new THREE.Vector3(0, 1, 0)) < 0)
      phi = pi * 2 - phi;

    function removeCreateAdd<T extends Object3D>(o: T, createCallback: () => T): T {
      if (o) {
        object.remove(o);
      }

      const newObject = createCallback();
      object.add(newObject);
      return newObject;
    }

    thetaArc = removeCreateAdd(thetaArc, () => {
      const arc = makeArc(theta, helperRadius);
      arc.rotateY(-pi/2);
      arc.rotateX(phi-pi/2);
      return arc;
    });

    const projectedRadius = helperRadius * cos(Math.max(pi/2 - theta, 0));
    phiArc = removeCreateAdd(phiArc, () => makeArc(phi, projectedRadius));

    phiLine = removeCreateAdd(phiLine, () => {
      const line = makaeDashedLine(new THREE.Vector3(projectedRadius, 0, 0));
      line.rotateZ(phi);
      object.add(line);
      return line;
    });

    {
      const offset = -0.1;
      const x = cos(phi/2) * (projectedRadius + offset);
      const y = sin(phi/2) * (projectedRadius + offset);
      phiLabel.position.set(x, y, 0);
      phiLabel.rotation.set(0, 0, pi/2+phi/2);
    }

    thetaLabel.position.set(...polarToCaertesian(theta/2+0.07, phi, 0.5));
    thetaLabel.rotation.set(pi/2, phi, -theta/2);

    arrow.setDirection(point);
    rotationAxis.setArc(point);
  }

  {
    dragZone.onDrag((event: UserEvent, intersects: IntersectionMap) => {
      const sphereIntersection = intersects[sphere.uuid];
      if (sphereIntersection) { // mouse is over sphere
        const point = sphere.worldToLocal(sphereIntersection.point);
        point.normalize();
        setStateVectorToPoint(point);
      } else { // mouse is away from sphere
        const point = object.worldToLocal(new THREE.Vector3(event.x, event.y/aspectRatio, 0)).normalize();
        setStateVectorToPoint(point);
      }
    });
    captureZones.push(dragZone);
    object.add(arrow);
  }

  const dragCaptureZone = new DragCaptureZone([{uuid: 'background'}]);
  dragCaptureZone.onDrag((event: UserEvent) => {
    const sensitivity = 0.01;
    rotate(event.deltaY * sensitivity, 0, event.deltaX * sensitivity);
  });
  captureZones.push(dragCaptureZone);

  const axisLabels = new AxisLabels(object);
  axisLabels.layer.position.set(0, 0, 1); // the plane should be between the camera and the sphere
  scene.add(axisLabels.layer);
  scene.add(object);
  object.updateWorldMatrix(true, true);

  const raycaster = new THREE.Raycaster();

  function rotate(x: number, y: number, z: number) {
    object.rotation.x += x;
    object.rotation.y += y;
    object.rotation.z += z;
  }

  return {

    render() {
      axisLabels.align();

      {
        while (events.length) {

          const event = events.shift();
          raycaster.setFromCamera(event, camera);
          let intersects: IntersectionMap = intersectionsToMap(raycaster.intersectObjects(scene.children, true));

          if (activeZone) {
            if (!activeZone.process(true, event, intersects)) {
              activeZone = null;
            }
          } else {
            for (let i = 0; i < captureZones.length; i++) {
              const captureZone = captureZones[i];
              if (captureZone.process(false, event, intersects)) {
                activeZone = captureZone;
                break;
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    },

    setQuantumStateVector(theta: number, phi: number) {
      setStateVectorToPoint(new THREE.Vector3(...polarToCaertesian(theta, phi)));
    },

    setRotationAxis(x: number, y: number, z: number, rotationAngle: number) {
      rotationAxis.setDirection(new THREE.Vector3(x, y, z), rotationAngle);
    },

    onMouseDown(x: number, y: number) {
      events.push({type: 'mousedown', x, y});
    },

    onMouseUp(x: number, y: number) {
      events.push({type: 'mouseup', x, y});
    },

    onMouseMove(x: number, y: number, deltaX: number, deltaY: number) {
      events.push({type: 'mousemove', x, y, deltaX, deltaY});
    }
  };
}