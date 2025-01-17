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
import * as math from 'mathjs';
import { cos, equal, sin } from 'mathjs';

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

export function createArc(radians: number, radius: number, color: number | string = 0xffffff): Line {
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
    fillStyle?: string;
    strokeStyle?: string;
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

  g.fillStyle = options.fillStyle ?? 'white';
  g.fillText(text, 0, 40);
  g.strokeStyle = options.strokeStyle ?? 'black';
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
export function ketStr(val: any, dollars: boolean = true, mathtip: number[] | string | boolean = false) {
  val = '\\left | ' + String(val) + ' \\right \\rangle';
  if (mathtip) {
    // \\texttip
    val = `\\mathtip{
      ${val}
    }{
      ${Array.isArray(mathtip) ? `\\begin{bmatrix} ${mathtip.join(' \\\\ ')} \\end{bmatrix}` : mathtip}
    }`;
  }
  if (dollars) {
    val = '$$' + val + '$$';
  }
  return val;
}

export enum Ket {
  zero = ketStr('0', false),
  $0$ = ketStr('0', true),
  one = ketStr('1', false),
  $1$ = ketStr('1', true),
}

/**
 *
 * @param matrix A Matrix as a string. Columns are space separated and rows are separated by '\\'.
 * @returns
 */
export function parseMatrix(matrix: string): string[][] {
  let mx = matrix.split('\\').map((row) => row.trim().split(' '));
  // let mxMath = mx.map((el) => {
  //   console.log(el, 'el');
  //   return el.map((e) => {
  //     console.log('e', e);
  //     return math.parse(e);
  //   });
  //   return math.parse(el);
  // });
  // console.log(matrix, 'mxMath', mxMath);
  // return mxMath;
  return mx;
}
export function parse2DMatrix(matrix: string): [[string, string], [string, string]] {
  return parseMatrix(matrix) as [[string, string], [string, string]];
}

export function Matrix2Latex(matrix: math.MathArray | math.Matrix, scalar?: string, dollars: boolean = true): string {
  if (matrix === null) return '';

  // const gate = math.round(matrix, 2) as math.MathArray;
  const gate = math.matrix(math.round(matrix, 2));
  // ${gate[0][0].toString()} & ${gate[0][1].toString()} \\\\
  // ${gate[1][0].toString()} & ${gate[1][1].toString()}
  let tex = `
    \\left (
    \\begin{matrix}
      ${(() => {
        let res = gate.map((value, index, matrix) => {
          // console.log(value, 'index:', index, matrix, 'size:', math.size(matrix), math.size(matrix)[1], matrix.size(), matrix.size()[1]);
          let el = `${value}`;
          if (!(index[0] === matrix.size()[0] - 1 && index[1] === matrix.size()[1] - 1)) {
            if (index[1] === matrix.size()[1] - 1) {
              el += ' \\\\';
            } else if (index[1] < matrix.size()[1]) {
              el = el + ' &';
            }
          }
          return el;
        });
        // console.log(res, math.typeOf(res));
        // res = res.toArray()
        // res = math.concat(math.matrix(res));
        res = math.flatten(res);
        // console.log('res', math.typeOf(res), res);
        // let res2 = math.concat(...res.toArray());
        const res2 = res.toArray().join(' ');
        // console.log('res2', math.typeOf(res2), res2);
        // res = math.squeeze(res)
        return res2;
      })()}
    \\end{matrix}
    \\right )
    `;
  // ${math.apply(gate, 0, )}
  if (scalar) {
    tex = `${math.parse(scalar).toTex()} ${tex}`;
  }
  if (dollars) {
    tex = '$$' + tex + '$$';
  }
  return tex;
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
