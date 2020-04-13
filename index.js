import './style.scss';
import { GPU } from 'gpu.js';
import dat from 'dat.gui';
import throttle from 'lodash.throttle';
import cryptoRandomString from 'crypto-random-string';
import { hsv2rgb, rgb2hsv, hsvKernel, rgb2cmyk, cmyk2rgb, cmykKernel } from './kernels';
import { loadImage, createCanvas, saveImage, uploadImage, removeElement } from './utils';

function setupHSVKernel(image) {
  const canvasContainer = document.getElementById('canvas-container');
  let canvas = createCanvas([image.width, image.height], {
    el: canvasContainer,
    style: 'max-height: 80vh; max-width: 100%;'
  });

  let gpu = new GPU({
    canvas,
    // Need to preserve the drawing buffer for ability to save images.
    context: canvas.getContext('webgl2', { preserveDrawingBuffer: true })
  });

  gpu.addFunction(rgb2hsv);
  gpu.addFunction(hsv2rgb);

  let kernel = gpu.createKernel(hsvKernel, {
    graphical: true,
    output: [image.width, image.height]
  });

  return kernel;
}

function setupCMYKKernel(image) {
  const canvasContainer = document.getElementById('canvas-container');
  let canvas = createCanvas([image.width, image.height], {
    el: canvasContainer,
    style: 'max-height: 80vh; max-width: 100%;'
  });

  let gpu = new GPU({
    canvas,
    // Need to preserve the drawing buffer for ability to save images.
    context: canvas.getContext('webgl2', { preserveDrawingBuffer: true })
  });

  gpu.addFunction(cmyk2rgb);
  gpu.addFunction(rgb2cmyk);

  let kernel = gpu.createKernel(cmykKernel, {
    graphical: true,
    output: [image.width, image.height]
  });

  return kernel;
}

function randomImage() {
  const url = `https://source.unsplash.com/random?_=${cryptoRandomString({ length: 6 })}`;
  return loadImage(url);
}

// (async () => {
//   const setupKernel = setupHSVKernel;

//   let image = await randomImage();

//   let kernel = setupKernel(image);

//   const gui = new dat.GUI();

//   const hsv = {
//     hue: 0,
//     saturation: 0,
//     value: 0
//   };

//   // Attach events to the 'Choose Image' button
//   uploadImage((img) => {
//     image = img;
//     removeElement(kernel.canvas);
//     kernel = setupKernel(image);
//     kernel(image, hsv.hue, hsv.saturation, hsv.value);
//   });

//   // Attach events to the 'Random Image' Button
//   document.getElementById('random-btn').onclick = async () => {
//     removeElement(kernel.canvas);
//     image = await randomImage();
//     kernel = setupKernel(image);
//     kernel(image, hsv.hue, hsv.saturation, hsv.value);
//   }

//   const fns = {
//     download: () => saveImage(kernel.canvas)
//   }

//   const onChange = throttle(() => {
//     kernel(image, hsv.hue, hsv.saturation, hsv.value);
//   }, 50);

//   gui.add(hsv, 'hue', 0, 360).onChange(onChange);
//   gui.add(hsv, 'saturation', -1, 1).step(0.01).onChange(onChange);
//   gui.add(hsv, 'value', -1, 1).step(0.01).onChange(onChange);
//   gui.add(fns, 'download');

//   kernel(image, hsv.hue, hsv.saturation, hsv.value);
// })();

(async () => {
  const setupKernel = setupCMYKKernel;

  let image = await randomImage();
  let kernel = setupKernel(image);

  const gui = new dat.GUI();

  const cmyk = {
    cyan: 1,
    yellow: 1,
    magenta: 1,
    key: 1
  };

  const onChange = throttle(() => {
    kernel(image, cmyk.cyan, cmyk.magenta, cmyk.yellow, cmyk.key);
  }, 50);

  // Attach events to the 'Choose Image' button
  uploadImage((img) => {
    image = img;
    removeElement(kernel.canvas);
    kernel = setupKernel(image);
    // kernel(image, hsv.hue, hsv.saturation, hsv.value);
    onChange();
  });

  // Attach events to the 'Random Image' Button
  document.getElementById('random-btn').onclick = async () => {
    removeElement(kernel.canvas);
    image = await randomImage();
    kernel = setupKernel(image);
    onChange();
    // kernel(image, hsv.hue, hsv.saturation, hsv.value);
  }

  const fns = {
    download: () => saveImage(kernel.canvas)
  }

  gui.add(cmyk, 'cyan', 0, 1).step(0.01).onChange(onChange);
  gui.add(cmyk, 'magenta', 0, 1).step(0.01).onChange(onChange);
  gui.add(cmyk, 'yellow', 0, 1).step(0.01).onChange(onChange);
  gui.add(cmyk, 'key', 0, 1).step(0.01).onChange(onChange);
  gui.add(fns, 'download');

  kernel(image, cmyk.cyan, cmyk.magenta, cmyk.yellow, cmyk.key);
})();