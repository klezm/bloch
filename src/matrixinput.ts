import * as math from 'mathjs';
import { Matrix2x2 } from './eigen';
import { evaluate } from './parser';
import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { CHTML } from 'mathjax-full/js/output/chtml';
import { SVG } from 'mathjax-full/js/output/svg';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
RegisterHTMLHandler(browserAdaptor());

type OnChangeCallback = (matrix: Matrix2x2) => void;

export class MatrixInput {
  private onChange: OnChangeCallback;
  private container: HTMLDivElement;
  private parent: HTMLElement;
  private uScalar: HTMLInputElement;
  private u00: HTMLInputElement;
  private u01: HTMLInputElement;
  private u10: HTMLInputElement;
  private u11: HTMLInputElement;
  private GateQubitFormulaHTML: any;
  private texField: HTMLElement;

  constructor(p: HTMLElement, callback: OnChangeCallback) {
    this.onChange = callback;
    this.parent = p;
    this.container = document.createElement('div');
    this.container.innerHTML = `
    <div class="UinputContainer">
      <input class="Uin-pre">
      <!-- <div class="Uin-bra">·⋅×(</div> -->
      <div class="Uin-bra"></div>
      <input class="Uin-00">
      <input class="Uin-01">
      <input class="Uin-10">
      <input class="Uin-11">
      <div class="Uin-ket"></div>
    </div>
    <div id="qubitGateOpFormula"></div>
    `;

    this.uScalar = this.container.querySelector('.Uin-pre');
    this.u00 = this.container.querySelector('.Uin-00');
    this.u01 = this.container.querySelector('.Uin-01');
    this.u10 = this.container.querySelector('.Uin-10');
    this.u11 = this.container.querySelector('.Uin-11');

    [this.uScalar, this.u00, this.u01, this.u10, this.u11].forEach((input) => {
      input.addEventListener('change', this.onInputChange); // TODO: cleanup
    });

    // this.texField = this.container.querySelector(`[id="qubitGateOpFormula"]`);
    this.texField = this.container.querySelector(`#qubitGateOpFormula`);

    this.GateQubitFormulaHTML = mathjax.document(document, {
      InputJax: new TeX({
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)'],
        ],
        packages: AllPackages,
        SVG: {
          scale: 200,
          minScaleAdjust: 200,
        },
      }),
      // OutputJax: new CHTML(),
      OutputJax: new SVG(),
    });

    this.parent.appendChild(this.container);
  }

  setMatrix(matrix: [string, [string, string], [string, string]]) {
    this.uScalar.value = matrix[0];
    this.u00.value = matrix[1][0];
    this.u01.value = matrix[1][1];
    this.u10.value = matrix[2][0];
    this.u11.value = matrix[2][1];
  }

  getMatrix(): Matrix2x2 | null {
    const scalar = evaluate(this.uScalar.value || '1'); // if scalar is empty multiply with 1
    const matrix = [
      // [evaluate(this.u00.value) * scalar, evaluate(this.u01.value) * scalar],
      // [evaluate(this.u10.value) * scalar, evaluate(this.u11.value) * scalar],
      [evaluate(this.u00.value + ' * ' + scalar), evaluate(this.u01.value + ' * ' + scalar)],
      [evaluate(this.u10.value + ' * ' + scalar), evaluate(this.u11.value + ' * ' + scalar)],
    ];

    if (matrix.flat().find((item) => item === null) === null) return null;

    return matrix as Matrix2x2;
  }

  private onInputChange = () => {
    this.onChange(this.getMatrix());
  };

  qubitGateOpFormula(stateMatrix) {
    // let texField = this.container.querySelector('#qubitGateOpFormula');
    // const gate = math.format(this.getMatrix(), { notation: 'fixed', precision: 2 });
    // const gate = math.round(this.getMatrix(), 2);
    const gate = math.round(this.getMatrix(), 2) as math.MathArray;
    // console.log('gate:        ', gate);
    // console.log('stateMatrix: ', stateMatrix);
    // console.log(typeof gate, math.typeOf(gate));
    // const res = math.multiply(gate, gate);
    const res = math.multiply(gate, stateMatrix);
    // console.log('res:         ', res);
    // console.log(math.parse(res).toTex());
    // this.texField.innerHTML = String(res);
    this.texField.innerHTML = `
    $$
    \\left (
    \\begin{matrix}
      ${gate[0][0].toString()} & ${gate[0][1].toString()} \\\\
      ${gate[1][0].toString()} & ${gate[1][1].toString()}
    \\end{matrix}
    \\right )

    \\left (
    \\begin{matrix}
      ${math.round(stateMatrix[0], 2).toString()} \\\\
      ${math.round(stateMatrix[1], 2).toString()}
    \\end{matrix}
    \\right )

    =

    \\left (
    \\begin{matrix}
      ${math.round(res[0], 2).toString()} \\\\
      ${math.round(res[1], 2).toString()}
    \\end{matrix}
    \\right )
    $$
    `;
    this.GateQubitFormulaHTML.render().reset();
  }
}
