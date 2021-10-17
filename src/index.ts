// import style from './style.scss';
import './style.scss';
import { init } from './lib';
// import { init } as MathjaxInit from 'mathjax';

// import { MathJax } from 'mathjax-full/ts/mathjax';
// import { mathjax } from 'mathjax-full/js/mathjax';
// import { init as mjinit } from 'mathjax-full';
// import {
//   MathJax,
//   MathJaxObject,
//   MathJaxConfig,
// } from 'mathjax-full/js/components/global.js';

// console.log(mjinit);

// import * as MathjaxInit from 'mathjax';
// console.log(MathjaxInit);
// MathjaxInit
// mathjax
// MathJax
//   .init({
//     loader: { load: ['input/tex', 'output/svg'] },
//   })
//   .then((MathJax) => {
//     const svg = MathJax.tex2svg('\\frac{1}{x^2-1}', { display: true });
//     console.log(MathJax.startup.adaptor.outerHTML(svg));
//   })
//   .catch((err) => console.log(err.message));
// MathJax.config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}})
// console.log(MathJax.config);
// MathJax.config = {
//   tex2jax: {
//     inlineMath: [
//       ['$', '$'],
//       ['\\(', '\\)'],
//     ],
//   },
//     startup: {
//         ready: () => {
//           console.log('MathJax is loaded, but not yet initialized');
//           MathJax.startup.defaultReady();
//           console.log('MathJax is initialized, and the initial typeset is queued');
//         }
//       }
// };
// console.log(MathJax.config);

window.onload = function () {
  (function () {
    let scriptConf = document.createElement('script');
    // scriptConf.append(document.createTextNode("MathJax = {tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]}, svg: {fontCache: 'global'}};"));
    scriptConf.innerHTML = `MathJax = {
      tex: {
        inlineMath: [
          ['$', '$'],
          // ['\\(', '\\)'],
        ],
      },
      SVG: {
          fontCache: 'global',
          scale: 200,
          minScaleAdjust: 200
        },
      startup: {
        ready: () => {
          console.log('MathJax is loaded, but not yet initialized');
          MathJax.startup.defaultReady();
          console.log('MathJax is initialized, and the initial typeset is queued');
        },
      },
    }`;
    document.head.appendChild(scriptConf);

    let script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);
  })();

  // (function () {
  //   let script = document.createElement('script');
  //   script.src = './src/load-mathjax.ts';
  //   script.async = true;
  //   document.head.appendChild(script);
  // })();

  const bloch = init(
    document.getElementById('stateContainer'),
    document.getElementById('matrixContainer'),
    document.getElementById('canvasContainer'),
    document.getElementById('buttonContainer')
  );

  function resizeCanvas() {
    const container = document.getElementById('container');
    const settings = document.getElementById('settings');
    const canvasRoot = document.getElementById('canvasRoot');

    const containerRect = container.getBoundingClientRect();
    const settingsRect = settings.getBoundingClientRect();
    const canvasRootRect = canvasRoot.getBoundingClientRect();

    if (settingsRect.top < canvasRootRect.top) {
      // wrapped
      canvasRoot.style.height = String(containerRect.height - settingsRect.height) + 'px';
    } else {
      // not wrapped, settings and canvas are next to each other
      canvasRoot.style.height = null;
    }

    const size = Math.min(canvasRoot.clientWidth, canvasRoot.clientHeight);
    bloch.resizeCanvas(size);
  }

  window.onresize = resizeCanvas;
  resizeCanvas();
};
