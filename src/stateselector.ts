import { ButtonSelector, OnClickCallback } from './buttonselector';

// import { MathJaxObject } from 'mathjax-full/js/components/global.js';
// import { MathJax } from 'mathjax-full';
import { mathjax } from 'mathjax-full/js/mathjax';
import { MathJax } from 'mathjax-full/js/components/global';
import { ketStr } from './utils';

export enum SelectedState {
  state0 = 'state0',
  state1 = 'state1',
  statePlus = 'statePlus',
  stateMinus = 'stateMinus',
  stateI = 'stateI',
  stateMinusI = 'stateMinusI',
}

export class StateSelector extends ButtonSelector<SelectedState> {
  constructor(p: HTMLElement, onClick: OnClickCallback) {
    super(p, onClick, [
      {
        key: SelectedState.state0,
        // value: '|0⟩',
        // value: '$$\\left | 0 \\right \\rangle$$',
        value: ketStr('0'),
      },
      {
        key: SelectedState.state1,
        // value: '|1⟩',
        value: ketStr('1'),
      },
      {
        key: SelectedState.statePlus,
        value: ketStr('+'),
      },
      {
        key: SelectedState.stateMinus,
        value: ketStr('-'),
      },
      {
        key: SelectedState.stateI,
        value: ketStr('i'),
      },
      {
        key: SelectedState.stateMinusI,
        value: ketStr('-i'),
      },
    ]);
  }
}
