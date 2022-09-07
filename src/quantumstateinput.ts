import { acos, asin, cos, pi, sin, exp, complex, prod, round, format, multiply } from 'mathjs';
import * as math from 'mathjs';
import { extendedComplexString, ketStr } from './utils';
// import { mathjax } from 'mathjax-full/js/mathjax';
// import { MathJax } from 'mathjax-full/js/components/global';
// import { MathJax } from 'mathjax-full/js/mathjax';

import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { CHTML } from 'mathjax-full/js/output/chtml';
import { SVG } from 'mathjax-full/js/output/svg';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
RegisterHTMLHandler(browserAdaptor());

type OnChangeCallback = (theta: number, phi: number) => void;

const AMPLITUDE = 'amplitude';
// const AMPLITUDE0 = 'amplitude0';
// const AMPLITUDE1 = 'amplitude1';
const PHASE = 'phase';

export class QuantumStateInput {
  private container: HTMLElement;
  private parent: HTMLElement;
  private qubitFormula: HTMLElement;
  private qubitFormulaHTML: any;
  // private amplitude0: HTMLInputElement;
  // private amplitude1: HTMLInputElement;
  private amplitude; //: HTMLInputElement;
  private amplitudeSlider; //: HTMLInputElement;
  private phase: HTMLInputElement;
  private phaseSlider: HTMLInputElement;
  private onChangeCallback: OnChangeCallback;
  private texCallback: Function;

  constructor(p: HTMLElement, callback: OnChangeCallback, texCallback: Function) {
    this.parent = p;
    this.onChangeCallback = callback;
    this.texCallback = texCallback;
    this.container = document.createElement('div');

    //
    // input range
    //
    // https://stackoverflow.com/questions/34360448/is-it-possible-to-link-a-range-and-a-numerical-html-input
    // https://stackoverflow.com/questions/41830417/custom-form-with-range-sliders-breaks-and-i-dont-know-why?rq=1
    // https://stackoverflow.com/questions/28900077/why-is-event-target-not-element-in-typescript
    // https://www.webcomponents.org/element/@polymer/paper-slider

    //
    // input range with ticks:
    //
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range
    // https://stackoverflow.com/questions/40392207/range-input-thumb-doesnt-align-with-axis-ticks
    // https://stackoverflow.com/questions/26612700/ticks-for-type-range-html-input

    //
    // plot sinus cosinus
    //
    // https://stackoverflow.com/questions/29917446/drawing-sine-wave-in-canvas/58673385#58673385
    // https://stackoverflow.com/questions/13932704/how-to-draw-sine-waves-with-svg-js
    this.container.innerHTML = `
    <div id="qubitStateFormula" style="display:flex"></div>

    <div style="display: flex">
      <input name="${AMPLITUDE}" type="range" min="0" max="1" step=.1 value="0"/>
      $$\\large {\\color{SkyBlue}\\theta} = \\:$$
      <input id=ampli name="${AMPLITUDE}" style="width: 55px; height: fit-content; align-self: center;" min=0 max=1 step=.1 type="number"/>
      $$\\: \\large \\pi$$
    </div>
    <div style="display: flex;">
      <input name="${PHASE}" type="range" min="0" max="2" step=.05 value="0"/>
      $$\\large {\\color{Fuchsia} \\phi} = \\:$$
      <input id=phase name="${PHASE}" style="width: 55px; height: fit-content; align-self: center;" min=0 max=2 step=.05 type="number"/>
      $$\\: \\large \\pi$$
    </div>

    $$cos \\left ( \\frac{\\color{SkyBlue}θ}{2} \\right )
    \\widehat{=} \\: amplitude \\: \\widehat{=}
    sin \\left ( \\frac{\\color{SkyBlue}θ}{2} \\right ) e^{i\\color{Fuchsia} \\phi}$$
    $$sin \\left ( \\frac{\\color{SkyBlue}θ}{2} \\right ) \\widehat{=} magnitude
    \\qquad
    {\\color{Fuchsia} \\phi} \\widehat{=} phase$$
    `;

    /**`
        <div id="formulas" style="display=flex">
        <!-- cos(<input id=ampli name="${AMPLITUDE}" style="width: 55px" min=0 max=1 step=.1 type="number"/>π/2) -->
        cos({this.amplitude[0].value}π/2)
        |0⟩ +
        <!-- <td>sin(<input id=ampli name="${AMPLITUDE}" style="width: 55px"/>π/2)</td> -->
        sin(<input name="${AMPLITUDE}" style="width: 55px" type="number" disabled/>π/2)
        <!-- + exp(i<input id=phase name="${PHASE}" style="width: 55px" min=0 max=2 step=.1 type="number"/>π) -->
        + exp(i` +
      '${this.phase.value}' +
      `π)
        |1⟩
    </div>
    <!-- <input type="range" min="0" max="2" value="0" (change)="getSliderValue($event)" (oninput)="getSliderValue($event)"/> -->
    `*/

    this.qubitFormula = this.container.querySelector(`[id="qubitStateFormula"]`);
    // this.amplitude0 = this.container.querySelector(`[name=${AMPLITUDE}]`);
    // this.amplitude1 = this.container.querySelector(`[name=${AMPLITUDE}]`);
    this.amplitude = this.container.querySelectorAll(`[name=${AMPLITUDE}][type="number"]`);
    // [this.amplitude0, this.amplitude1, this.phase].forEach((input) => {
    // [...this.amplitude, this.phase].forEach((input) => {
    [...this.amplitude].forEach((input) => {
      // input.addEventListener('change', this.onInputChange); // TODO: cleanup
      input.addEventListener('change', this.updateTheta);
    });

    this.amplitudeSlider = this.container.querySelector(`[name=${AMPLITUDE}][type="range"]`);
    this.amplitudeSlider.addEventListener('input', this.updateThetaSlider);

    this.phase = this.container.querySelector(`[name=${PHASE}][type="number"]`);
    this.phase.addEventListener('input', this.updatePhi);

    this.phaseSlider = this.container.querySelector(`[name=${PHASE}][type="range"]`);
    this.phaseSlider.addEventListener('input', this.updatePhiSlider);

    // https://stackoverflow.com/questions/60776086/mathjax-updated-rendering-of-latex-equations
    this.qubitFormulaHTML = mathjax.document(document, {
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

  getStateParams() {
    return {
      theta: this.amplitude[0].value,
      phi: this.phase.value,
    };
  }

  getStateVec() {
    const theta = this.amplitude[0].value;
    const phi = this.phase.value;
    const up = cos((theta * pi) / 2);

    let down = sin((theta * pi) / 2);
    // console.log('down: ', down);
    let ex = exp(prod(complex(0, 1), parseFloat(phi), pi));
    // (ex as unknown as math.Complex).re = 0;
    // console.log('ex: ', ex);
    down = multiply(down, ex);
    // console.log('down2: ', down);
    return [up, down];
  }

  update(theta: number, phi: number) {
    const precision = 2;
    const thetaS = String((theta / pi).toFixed(precision));
    const phiS = String((phi / pi).toFixed(precision));

    // this.amplitude0.value = String(cos(theta / 2).toFixed(precision));
    // this.amplitude0.value = String((theta / pi).toFixed(precision));
    // this.amplitude1.value = String(sin(theta / 2).toFixed(precision));
    // this.amplitude1.value = String((theta / pi).toFixed(precision));
    this.amplitude.forEach((x) => {
      x.value = thetaS;
    });
    this.amplitudeSlider.value = thetaS;

    // this.phase.value = 'i' + String(phi.toFixed(precision));
    this.phase.value = phiS;
    this.phaseSlider.value = phiS;
    this.qubitStateFormula(thetaS, phiS);
  }

  // private qubitStateFormula(theta?: number, phi?: number) {
  private qubitStateFormula(theta, phi) {
    // if (theta === undefined) theta = this.amplitude[0].value;
    // theta = theta || this.amplitude[0].value;
    // phi = phi || parseFloat(this.phase.value);
    // <!-- <td> + exp(i${phi}π)</td> -->
    let ex = exp(prod(complex(0, 1), parseFloat(phi), pi)) as unknown as math.Complex;
    let sinT = sin((theta * pi) / 2);
    let ket1Scalar = round(multiply(ex as math.MathType,sinT as math.MathType) as math.Complex, 2);
    //(ex as unknown as math.Complex).re = 0;
    this.qubitFormula.innerHTML = `
      \\begin{alignat}{3}
      \\large  |ψ⟩
      & \\large = & \\large  cos \\left ( \\frac{\\color{SkyBlue}\\theta}{2} \\right )
      && \\large |0⟩
      && \\large + && \\large sin \\left ( \\frac{\\color{SkyBlue}\\theta}{2} \\right )
      && \\large \\qquad \\quad
      e^{i \\color{Fuchsia} \\phi}
      && \\large |1⟩ \\\\

      & \\large = & \\: \\large cos \\left ( \\frac{{\\color{SkyBlue}${theta}π}}{2} \\right )
      && \\large ${ketStr('0', false)}
      && \\large + && \\large sin \\left ( \\frac{{\\color{SkyBlue}${theta}π}}{2} \\right )
      && \\large \\: e^{i {\\color{Fuchsia} ${phi}π}}
      && \\large ${ketStr('1', false)} \\\\

      %& \\large = & \\large ${round(cos((theta * pi) / 2), 4)}
      & \\large = & \\large ${format(cos((theta * pi) / 2), {
        notation: 'fixed',
        precision: 2,
      })}
      && \\large ${ketStr('0', false)}
      %&& \\large + && \\large ${round(ket1Scalar.re, 4)} %\\cdot
      && \\large + && (\\large ${format(ket1Scalar.re, {
        notation: 'fixed',
        precision: 2,
      })} %\\cdot
      % && \\large  \\: ${(ket1Scalar.im >= 0?'+ ':'')+round(ket1Scalar.im, 4)}
      && \\large  \\: ${(ket1Scalar.im >= 0?'+ ':'')+format(ket1Scalar.im,{
        notation: 'fixed',
        precision: 2
      })+'i'} )
      && \\large ${ketStr('1', false)}
      \\end{alignat}
      `;
    this.qubitFormulaHTML.render().reset();
    // TODO: fix
    // this.texCallback();
  }

  private updatePhi = (e: Event) => {
    const phi = parseFloat(this.phase.value) * pi;
    const theta = parseFloat(this.amplitude[0].value) * pi;
    this.onChangeCallback(theta, phi);
  };
  private updatePhiSlider = (e: Event) => {
    const phi = parseFloat((e.target as HTMLInputElement).value) * pi;
    const theta = parseFloat(this.amplitude[0].value) * pi;
    this.onChangeCallback(theta, phi);
  };

  private updateTheta = (e: Event) => {
    const phi = parseFloat(this.phase.value) * pi;
    // console.log('update theta');
    // console.log(e);
    // console.log(e.target);
    // const theta = parseFloat(e.target.value) * pi;
    const theta = parseFloat(this.amplitude[0].value) * pi;
    this.onChangeCallback(theta, phi);
  };
  private updateThetaSlider = (e: Event) => {
    const phi = parseFloat(this.phase.value) * pi;
    const theta = parseFloat((e.target as HTMLInputElement).value) * pi;
    this.onChangeCallback(theta, phi);
  };

  private onInputChange = (event: Event) => {
    const targetName: string = (event.target as HTMLInputElement).name;

    // let theta;
    // switch (targetName) {
    //   case AMPLITUDE1:
    //     // theta = asin(parseFloat(this.amplitude1.value)) * 2;
    //     theta = parseFloat(this.amplitude1.value) / pi;
    //     break;

    //   case AMPLITUDE0:
    //   default:
    //     // theta = acos(parseFloat(this.amplitude0.value)) * 2;
    //     theta = parseFloat(this.amplitude0.value) / pi;
    //     break;
    // }
    const theta = parseFloat(this.amplitude[0].value) * pi;

    // const phi = parseFloat(this.phase.value.replace('i', ''));
    const phi = parseFloat(this.phase.value) * pi;
    this.onChangeCallback(theta, phi);
  };
}
