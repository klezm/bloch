import {
  CircleGeometry,
  DoubleSide,
  EdgesGeometry,
  EllipseCurve,
  Line,
  LineBasicMaterial,
  LineCurve3,
  LineDashedMaterial,
  LineLoop,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from 'three';

/**
 * #buildCircles
 *
 * Creates guiding circles in Bloch spheres. If a vector is supplied, the vector will be used to transform
 * the circles.
 *
 * @param  {colors}
 * @param  {vector}
 * @return {circles}
 */
export function buildCircles(
  colors: number[] = [0xffffff, 0xd8d8d8],
  vector = undefined
): Object3D {
  let circles = new Object3D();
  let a, b, c;
  if (vector !== undefined) {
    a = vector[0];
    b = vector[1];
    c = vector[2];
  }

  circles.add(buildCircle(1, 32, 'z', [a, b, c], colors)); // z
  circles.add(buildCircle(1, 32, 'x', [a, c, b], colors)); // x
  circles.add(buildCircle(1, 32, 'y', [c, b, a], colors)); // y

  return circles;
}

/**
 * #buildCircle
 *
 * Builds the circle with the specified radius, amount of segments, rotation angle and color. If a vector is
 * supplied, the vector will be used to transform the circle.
 *
 * @param  {radius}
 * @param  {segments}
 * @param  {rotation}
 * @param  {vector}
 * @param  {colors}
 * @return {circle}
 */
export function buildCircle(
  radius: number,
  segments: number = 100,
  rot: string,
  vector,
  colors
): Object3D {
  let circle = new Object3D();

  let circleGeometry = new CircleGeometry(radius, segments);
  let lineGeometry = new CircleGeometry(radius, segments);
  let circleEdges = new EdgesGeometry(circleGeometry);

  if (vector !== undefined && vector[0] !== undefined) {
    circleGeometry.applyMatrix4(new Matrix4().makeScale(vector[0], vector[1], vector[2]));
    lineGeometry.applyMatrix4(new Matrix4().makeScale(vector[0], vector[1], vector[2]));
  }

  const lineMaterial = new LineDashedMaterial({
    color: colors[1],
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    depthTest: false,
    dashSize: 0.05,
    gapSize: 0.05,
    linewidth: 1,
  });

  // const lineMaterial = new LineBasicMaterial({
  //   color: colors[1],
  //   transparent: true,
  //   opacity: 0.5,
  //   depthWrite: false,
  //   depthTest: false,
  //   linewidth: 1,
  // });

  // // let line = new LineCurve3(lineGeometry, lineMaterial);
  // let line = new Line(circleEdges, lineMaterial);
  let line = new LineLoop(circleEdges, lineMaterial);
  // const curve = new EllipseCurve(
  //   0, // ax
  //   0, // aY
  //   1, // xRadius
  //   1, // yRadius
  //   0, // aStartAngle
  //   2 * Math.PI, // aEndAngle
  //   false, // aClockwise
  //   0 // aRotation
  // );
  // lineGeometry.setFromPoints(curve.getPoints(50));
  // let line = new Line(lineGeometry, lineMaterial);
  line.computeLineDistances();
  circle.add(line);

  if (rot === 'y') {
    circle.rotation.x = Math.PI / 2;
  } else if (rot === 'x') {
    circle.rotation.y = Math.PI / 2;
  } else {
    // rot === 'z'
    let circleMaterial = new MeshBasicMaterial({
      color: colors[0],
      transparent: true,
      side: DoubleSide,
      opacity: 0.2,
      depthWrite: false,
      depthTest: false,
    });
    let base = new Mesh(circleGeometry, circleMaterial);
    circle.add(base);
  }

  return circle;
}
