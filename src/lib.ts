import { makeBloch, QuantumStateChangeCallback } from './bloch';
import { calculateOriantation, Matrix2x2 } from './eigen';
import { gate2Matrix, GateSelector, SelectedGate } from './gateselector';
import { SelectedState, StateSelector } from './stateselector';
import { MatrixInput } from './matrixinput';
import { QuantumStateInput } from './quantumstateinput';
import { parse2DMatrix } from './utils';
import { isArray, min, pi } from 'mathjs';

// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function toNormalizedCoordinates(canvas: HTMLCanvasElement, event: MouseEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  return [
    ((event.clientX - rect.left) / canvas.width) * 2 - 1,
    -(((event.clientY - rect.top) / canvas.height) * 2 - 1),
  ];
}

function initCanvas(canvas: HTMLCanvasElement, quantumStateChanged: QuantumStateChangeCallback) {
  let previousMousePosition = { x: 0, y: 0 };
  const bloch = makeBloch(canvas, quantumStateChanged);
  bloch.setQuantumStateVector(3.14 / 4, 3.14 / 2);

  function onPointerDown(event: MouseEvent) {
    previousMousePosition = { x: event.pageX, y: event.pageY };
    bloch.onMouseDown(...toNormalizedCoordinates(canvas, event));
  }

  function onPointerUp(event: MouseEvent) {
    bloch.onMouseUp(...toNormalizedCoordinates(canvas, event));
  }

  function onPointerMove(event: MouseEvent) {
    let deltaMove = {
      x: event.pageX - previousMousePosition.x,
      y: event.pageY - previousMousePosition.y,
    };

    bloch.onMouseMove(...toNormalizedCoordinates(canvas, event), deltaMove.x, deltaMove.y);

    previousMousePosition = { x: event.pageX, y: event.pageY };
  }

  function render(time: number) {
    bloch.render();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // TODO: cleanup
  canvas.addEventListener('pointerdown', onPointerDown, false);
  window.addEventListener('pointerup', onPointerUp, false);
  window.addEventListener('pointermove', onPointerMove, false);

  return bloch;
}

export function init(
  stateContainer: HTMLElement,
  matrixContainer: HTMLElement,
  canvasContainer: HTMLElement,
  buttonContainer: HTMLElement
) {
  function createSaveImageButton(getDataURLCallback: () => string) {
    const container = document.createElement('div');

    const button = document.createElement('button');
    button.textContent = 'Save image';
    container.appendChild(button);

    const link = document.createElement('a');
    container.appendChild(link);

    // TODO: clenaup
    button.addEventListener('click', () => {
      link.setAttribute('download', 'bloch.png');
      link.setAttribute('href', getDataURLCallback());
      link.click();
    });

    return container;
  }

  function createViewButtons() {
    const container = document.createElement('div');

    const buttoni = document.createElement('button');
    buttoni.textContent = 'i';
    container.appendChild(buttoni);

    const buttonp = document.createElement('button');
    buttonp.textContent = '+';
    container.appendChild(buttonp);

    const button0 = document.createElement('button');
    button0.textContent = '0';
    container.appendChild(button0);

    button0.addEventListener('click', () => {
      // bloch.setRotation(0, 0, 0); // (top: i right: + front: 0)
      // bloch.setRotation(0, 0, pi / 2); // (top: + right: -i front: 0)
      // bloch.setRotation(0, 0, pi); // (top: -i right: - front: 0)

      // bloch.setRotation(0, pi / 2, 0, true); // (top: 0 right: i front: +)
      // bloch.setRotation(0, 0, (3 * pi) / 2); // (top: i right: + front: 0)
      bloch.setRotation(0, 0, -pi / 2); // (top: - right: i front: 0)
      // bloch.setRotation(-pi / 2, 0, -pi / 2); // (top: 0 right: i front: +)
      // bloch.setRotation(-pi / 2, 0, -pi); // (top: 0 right: - front: i)
    });

    buttoni.addEventListener('click', () => {
      bloch.setRotation(-pi / 2, 0, -pi); // (top: 0 right: - front: i)
    });

    buttonp.addEventListener('click', () => {
      bloch.setRotation(-pi / 2, 0, -pi / 2); // (top: 0 right: i front: +)
    });

    return container;
  }

  function createCanvas() {
    const element = document.createElement('canvas');
    element.width = 500;
    element.height = 500;
    element.style.setProperty('touch-action', 'none');
    return element;
  }

  const quantumStateInput = new QuantumStateInput(
    stateContainer,
    (theta: number, phi: number) => bloch.setQuantumStateVector(theta, phi),
    () => qubitGateOpFormula()
  );

  new StateSelector(stateContainer, (option: string) => {
    const optionToPhiAndTheta: any = {
      [SelectedState.state0]: { theta: 0, phi: 0 },
      [SelectedState.state1]: { theta: pi, phi: 0 },
      [SelectedState.statePlus]: { theta: pi / 2, phi: 0 },
      [SelectedState.stateMinus]: { theta: pi / 2, phi: pi },
      [SelectedState.stateI]: { theta: pi / 2, phi: pi / 2 },
      [SelectedState.stateMinusI]: { theta: pi / 2, phi: (3 * pi) / 2 },
    };

    const { theta, phi } = optionToPhiAndTheta[option];
    quantumStateInput.update(theta, phi);
    bloch.setQuantumStateVector(theta, phi);
    qubitGateOpFormula();
  });

  new GateSelector(matrixContainer, (option: string, onlyMatrix: boolean = false) => {
    // const optionToMatrix: {
    //   [key: string]: [string, [string, string], [string, string]];
    //   // [key: string]: [string, [string, string], [string, string]] | string[];
    //   // [key: string]: [string, string];
    //   // [key: string]: string[];
    //   // [key: string]: any[];
    // } = {
    //   [SelectedGate.X]: ['', ...parse2DMatrix('0 1 \\ 1 0')], // NOT, Bit-Flip
    //   [SelectedGate.Y]: ['', ...parse2DMatrix('0 -i \\ i 0')],
    //   [SelectedGate.Z]: ['', ...parse2DMatrix('1 0 \\ 0 -1')], // = T^4 Phase-Flip
    //   [SelectedGate.H]: ['sqrt(1/2)', ...parse2DMatrix('1 1 \\ 1 -1')], // Hadamard

    //   [SelectedGate.RX]: ['sqrt(1/2)', ...parse2DMatrix('1 -i \\ -i 1')], // θ=π/2 = exp(-i(θ/2)X)
    //   [SelectedGate.RY]: ['sqrt(1/2)', ...parse2DMatrix('1 -1 \\ 1 1')], // θ=π/2 = exp(-i(θ/2)Y)
    //   // [SelectedGate.RXdg]: ['sqrt(1/2)', ...parse2DMatrix('1 i \\ i 1')],
    //   // [SelectedGate.RYdg]: ['sqrt(1/2)', ...parse2DMatrix('1 1 \\ -1 1')],

    //   [SelectedGate.SX]: ['sqrt(1/2)', ...parse2DMatrix('1+i 1-i \\ 1-i 1+i')], // Sqrt of X
    //   // [SelectedGate.SXdg]: ['sqrt(1/2)', ...parse2DMatrix('1-i 1+i \\ 1+i 1-i')],
    //   // [SelectedGate.T]: ['', ...parse2DMatrix('1 0 \\ 0 exp(i*pi/4)')], // pi/8 // Equivalent to a π/4 radian rotation about the Z axis.
    //   // [SelectedGate.Tdg]: ['', ...parse2DMatrix('1 0 \\ 0 exp(-i*pi/4)')], // Equivalent to a -π/4 radian rotation about the Z axis.
    //   [SelectedGate.S]: ['', ...parse2DMatrix('1 0 \\ 0 i')], // = T^2 Phase // Equivalent to π/2 radian rotation about the Z axis.
    //   // [SelectedGate.Sdg]: ['', ...parse2DMatrix('1 0 \\ 0 -i')], // Singleton // Equivalent to -π/2 radian rotation about the Z axis.

    //   // [SelectedGate.P]: ['', ...parse2DMatrix('1 0 \\ 0 exp(i*λ)')], // λ=π=>Z λ=π/2=>S λ=π/4=>T Phase-Shift
    //   // [SelectedGate.I]: ['', ...parse2DMatrix('1 0 \\ 0 1')], // Identity

    //   [SelectedGate.Clear]: ['', ['', ''], ['', '']],
    // };
    // // const optionToMatrix: {
    // //   [key: string]: [string, [string, string], [string, string]];
    // // } = Object.fromEntries(Object.entries(optionToMatrix_).map(([key, value]) => {
    // //     if (isArray(value[1])) {return [key, value as [string, [string, string], [string, string]]];}
    // //     return [key, [value[0], ...parse2DMatrix(value[1])]];
    // //   }));
    const optionToMatrix = gate2Matrix;

    if (onlyMatrix) {
      return optionToMatrix[option];
    }

    matrixInput.setMatrix(optionToMatrix[option]);
    setMatrixOnBloch(matrixInput.getMatrix());
  });
  const matrixInput = new MatrixInput(matrixContainer, (matrix: Matrix2x2) =>
    setMatrixOnBloch(matrix)
  );

  const setMatrixOnBloch = (matrix: Matrix2x2 | null) => {
    qubitGateOpFormula();
    if (matrix === null) {
      bloch.hideRotationAxis();
      return;
    }

    const orientation = calculateOriantation(matrix);
    bloch.setRotationAxis(orientation.x, orientation.y, orientation.z, orientation.rotationAngle);
  };

  function qubitGateOpFormula() {
    // matrixInput.getMatrix();
    const state = quantumStateInput.getStateVec();
    matrixInput.qubitGateOpFormula(state);
  }

  buttonContainer.appendChild(
    createSaveImageButton(
      () => canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream') // here is the most important part because if you dont replace you will get a DOM 18 exception.
    )
  );
  buttonContainer.appendChild(createViewButtons());

  let canvas: HTMLCanvasElement = createCanvas();
  canvasContainer.appendChild(canvas);
  const bloch = initCanvas(canvas, (theta, phi) => quantumStateInput.update(theta, phi));

  return {
    resizeCanvas(size: number) {
      canvas.height = size;
      canvas.width = size;
      bloch.adaptToResizedCanvas();
    },
  };
}
