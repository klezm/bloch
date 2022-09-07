import {
  ArrowHelper,
  BufferGeometry,
  CatmullRomCurve3,
  CubicBezierCurve,
  CubicBezierCurve3,
  CurvePath,
  CylinderGeometry,
  DoubleSide,
  EllipseCurve,
  Intersection,
  Line,
  LineBasicMaterial,
  LineCurve3,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  QuadraticBezierCurve3,
  SphereGeometry,
  Texture,
  TubeGeometry,
  Vector3,
} from 'three';
import { Complex, cos, equal, sin } from 'mathjs';

type Map<T> = { [key: string]: T };
export type IntersectionMap = Map<Intersection<Object3D>>;
export type UUIDMap = Map<true>;

function toMap<T, V>(list: T[], keyExtractor: (item: T) => string, valueExtractor: (item: T) => V) {
  let map: Map<V> = {};
  for (let i = 0; i < list.length; i++) {
    map[keyExtractor(list[i])] = valueExtractor(list[i]);
  }
  return map;
}

export function objectsToMap(objects: { uuid: string }[]): UUIDMap {
  return toMap(
    objects,
    (object) => object.uuid,
    () => true
  );
}

export function intersectionsToMap(intersections: Intersection<Object3D>[]) {
  return toMap(
    intersections,
    (intersection) => intersection.object.uuid,
    (intersection) => intersection
  );
}

export function polarToCaertesian(
  theta: number,
  phi: number,
  r: number = 1
): [number, number, number] {
  const x = r * sin(theta) * cos(phi);
  const y = r * sin(theta) * sin(phi);
  const z = r * cos(theta);
  return [x, y, z];
}

export function createArrow(x: number, y: number, z: number, hex: number = 0xffff00): ArrowHelper {
  const dir = new Vector3(x, y, z);
  dir.normalize();
  const origin = new Vector3(0, 0, 0);
  const length = 1;
  return new ArrowHelper(dir, origin, length, hex, 0.1, 0.06);
}

/**
 * Creates a vector with higher thickness than arrows in three.js
 *
 * @param x
 * @param y
 * @param z
 * @param hex
 * @returns
 */
export function createVec(
  x: number,
  y: number,
  z: number,
  hex: number = 0xffff00
  // with_ball: boolean = false
) {
  const origin = new Vector3(0, 0, 0);
  const dir = new Vector3(x, y, z);
  dir.normalize();
  const length = 1;
  // const path = new CatmullRomCurve3([origin, dir]);
  // // const path = new CubicBezierCurve3(origin, origin, origin, dir);
  // const path = new QuadraticBezierCurve3(origin, origin, dir);
  const path = new LineCurve3(origin, dir);
  const geometry = new TubeGeometry(path, 20, 0.01, 8, true);
  const material = new MeshBasicMaterial({ color: hex });
  const vector = new Mesh(geometry, material);

  // if (with_ball) {
  //   const dot = new SphereGeometry(0.05, 16, 12);
  //   const sphereMaterial = new MeshBasicMaterial({ color: hex });
  //   const ball = new Mesh(dot, sphereMaterial);

  //   return [vector, ball];}
  return new Mesh(geometry, material);
}

export function createSphere(): Mesh {
  const geometry = new SphereGeometry(1, 40, 40);
  const material = new MeshBasicMaterial({
    color: 0x44aa88,
    transparent: true,
    opacity: 0.25,
  });
  // const material = new MeshPhongMaterial({
  //   color: 0x44aa88,
  //   transparent: true,
  //   opacity: 0.1,
  // });
  return new Mesh(geometry, material);
}

export function createArc(radians: number, radius: number, color: number = 0xffffff): Line {
  const curve = new EllipseCurve(
    0,
    0, // ax, aY
    radius,
    radius, // xRadius, yRadius
    0,
    radians, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );

  const points = curve
    .getPoints(equal(radians, 0) ? 0 : 50)
    .map((point) => new Vector3(point.x, point.y, 0));
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color });
  return new Line(geometry, material);
}

export function createText(
  text: string,
  options: {
    renderOrder?: number;
    width?: number;
    height?: number;
  } = {}
): Mesh {
  const TEXT_SIZE = 0.15;
  options.width = options.width ?? TEXT_SIZE;
  options.height = options.height ?? TEXT_SIZE;

  //create image
  const bitmap = document.createElement('canvas');
  const g = bitmap.getContext('2d');
  bitmap.width = (60 * options.width) / TEXT_SIZE;
  bitmap.height = (60 * options.height) / TEXT_SIZE;
  g.font = 'Bold 40px Arial';

  g.fillStyle = 'white';
  g.fillText(text, 0, 40);
  g.strokeStyle = 'black';
  g.strokeText(text, 0, 40);

  // canvas contents will be used for a texture
  const texture = new Texture(bitmap);
  texture.needsUpdate = true;

  const geometry = new PlaneGeometry(options.width, options.height, 1);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    side: DoubleSide,
    transparent: true,
  });
  const plane = new Mesh(geometry, material);
  plane.renderOrder = options.renderOrder ?? 0;
  material.map = texture;
  return plane;
}

/**
 * Creates a ket "|val>" to be displayed with mathjax.
 * @param val
 * @param dollars
 * @returns
 */
export function ketStr(val: any, dollars: boolean = true) {
  val = '\\left | ' + String(val) + ' \\right \\rangle';
  if (dollars) {
    val = '$$' + val + '$$';
  }
  return val;
}

/**
 * equivalen to numpy.linSpace
 * @param startValue
 * @param stopValue
 * @param cardinality
 * @returns
 */
export function linSpace(startValue, stopValue, cardinality) {
  // copied from https://stackoverflow.com/a/40475362/9058671
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

export function extendedComplexString(complex: Complex) : string {
  var re = complex['re'];
  var im = complex['im'];
  var ret = "";

  if (complex['isNaN']()) {
    return 'NaN';
  }

  if (complex['isInfinite']()) {
    return 'Infinity';
  }

  if (Math.abs(re) < complex['EPSILON']) {
    re = 0;
  }

  if (Math.abs(im) < complex['EPSILON']) {
    im = 0;
  }
  if (re < 0) {
    re = -re;
    ret += "-";
  } else {
    ret += "+";
  }
  ret += re.toFixed(2);
  ret += " ";
  if (im < 0) {
    im = -im;
    ret += "-";
  } else {
    ret += "+";
  }
  ret += " ";
  ret += im.toFixed(2);
  return ret + "i";
}
