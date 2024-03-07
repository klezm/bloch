import * as math from 'mathjs';
import { ButtonSelector, OnClickCallback } from './buttonselector';
import { ketStr, Matrix2Latex, parse2DMatrix } from './utils';

export enum SelectedGate {
  // https://docs.quantum.ibm.com/api/qiskit/circuit_library
  // https://algassert.com/quirk
  // https://en.wikipedia.org/wiki/List_of_quantum_logic_gates
  X = 'X',
  Y = 'Y',
  Z = 'Z',
  H = 'H',
  RX = 'RX',
  RY = 'RY',
  SX = 'SX',
  // T = 'T',
  S = 'S',
  Clear = 'Clear',
}

export const gate2Matrix: {
  [key: string]: [string, [string, string], [string, string]];
} = {
  [SelectedGate.X]: ['', ...parse2DMatrix('0 1 \\ 1 0')], // NOT, Bit-Flip
  [SelectedGate.Y]: ['', ...parse2DMatrix('0 -i \\ i 0')],
  [SelectedGate.Z]: ['', ...parse2DMatrix('1 0 \\ 0 -1')], // = T^4 Phase-Flip
  [SelectedGate.H]: ['sqrt(1/2)', ...parse2DMatrix('1 1 \\ 1 -1')], // Hadamard

  [SelectedGate.RX]: ['sqrt(1/2)', ...parse2DMatrix('1 -i \\ -i 1')], // θ=π/2 = exp(-i(θ/2)X)
  [SelectedGate.RY]: ['sqrt(1/2)', ...parse2DMatrix('1 -1 \\ 1 1')], // θ=π/2 = exp(-i(θ/2)Y)
  // [SelectedGate.RXdg]: ['sqrt(1/2)', ...parse2DMatrix('1 i \\ i 1')],
  // [SelectedGate.RYdg]: ['sqrt(1/2)', ...parse2DMatrix('1 1 \\ -1 1')],

  [SelectedGate.SX]: ['sqrt(1/2)', ...parse2DMatrix('1+i 1-i \\ 1-i 1+i')], // Sqrt of X
  // [SelectedGate.SXdg]: ['sqrt(1/2)', ...parse2DMatrix('1-i 1+i \\ 1+i 1-i')],
  // [SelectedGate.T]: ['', ...parse2DMatrix('1 0 \\ 0 exp(i*pi/4)')], // pi/8 // Equivalent to a π/4 radian rotation about the Z axis.
  // [SelectedGate.Tdg]: ['', ...parse2DMatrix('1 0 \\ 0 exp(-i*pi/4)')], // Equivalent to a -π/4 radian rotation about the Z axis.
  [SelectedGate.S]: ['', ...parse2DMatrix('1 0 \\ 0 i')], // = T^2 Phase // Equivalent to π/2 radian rotation about the Z axis.
  // [SelectedGate.Sdg]: ['', ...parse2DMatrix('1 0 \\ 0 -i')], // Singleton // Equivalent to -π/2 radian rotation about the Z axis.

  // [SelectedGate.P]: ['', ...parse2DMatrix('1 0 \\ 0 exp(i*λ)')], // λ=π=>Z λ=π/2=>S λ=π/4=>T Phase-Shift
  // [SelectedGate.I]: ['', ...parse2DMatrix('1 0 \\ 0 1')], // Identity

  [SelectedGate.Clear]: ['', ['', ''], ['', '']],
};
// const gate2Matrix: {
//   [key: string]: [string, [string, string], [string, string]];
// } = Object.fromEntries(Object.entries(gate2Matrix_).map(([key, value]) => {
//     if (isArray(value[1])) {return [key, value as [string, [string, string], [string, string]]];}
//     return [key, [value[0], ...parse2DMatrix(value[1])]];
//   }));

function latexButton(gate: SelectedGate) {
  return `$$\\mathtip{
    ${gate}
  }{
    ${(() => {
      const scalar = gate2Matrix[gate][0];
      const mx = math.evaluate(gate2Matrix[gate].slice(1, 3));
      const latex = Matrix2Latex(mx, scalar, false);
      return latex;
      // const scalar = gate2Matrix[gate][0];
      // const mx = gate2Matrix[gate].slice(1, 3);
      // return Matrix2Latex(mx as unknown as math.MathArray, scalar, false);
    })()}
  }$$`;
}

export class GateSelector extends ButtonSelector<SelectedGate> {
  constructor(p: HTMLElement, onClick: OnClickCallback) {
    super(p, onClick, [
      ...Object.values(SelectedGate)
        .filter((el, ix, ar) => el !== 'Clear')
        .map((val) => {
          return {
            key: val,
            value: latexButton(val),
          };
        }),
      {
        key: SelectedGate.Clear,
        value: SelectedGate.Clear,
      },
    ]);
  }
}
