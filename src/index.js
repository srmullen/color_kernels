import './style.scss';
import { GPU } from 'gpu.js';
import dat from 'dat.gui';
import throttle from 'lodash.throttle';
import cryptoRandomString from 'crypto-random-string';
import { rgbKernel, hsv2rgb, rgb2hsv, hsvKernel, rgb2cmyk, cmyk2rgb, cmykKernel } from './kernels';
import { loadImage, createCanvas, saveImage, uploadImage, removeElement } from './utils';

function randomImage() {
  // const url = `https://source.unsplash.com/random?_=${cryptoRandomString({ length: 6 })}`;
  const url = `https://picsum.photos/1000`;
  return loadImage(url);
}

function setupRGBKernel(image) {
  const canvasContainer = document.getElementById('canvas-container');
  const canvas = createCanvas([image.width, image.height], {
    el: canvasContainer,
    style: 'max-height: 80vh; max-width: 100%;'
  });

  const gpu = new GPU({
    canvas,
    // Need to preserve the drawing buffer for ability to save images.
    context: canvas.getContext('webgl2', { preserveDrawingBuffer: true })
  }); 

  return gpu.createKernel(rgbKernel, {
    graphical: true,
    output: [image.width, image.height]
  });
}

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

function rgbParams(image, kernel) {
  return {
    image,
    kernel,
    red: 1,
    green: 1,
    blue: 1
  };
}

function hsvParams(image, kernel) {
  return {
    image,
    kernel,
    hue: 0,
    saturation: 1,
    value: 1
  };
}

function cmykParams(image, kernel) {
  return {
    kernel,
    image,
    cyan: 1,
    yellow: 1,
    magenta: 1,
    key: 1
  };
}

function setupRGBGui(params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    params.kernel(params.image, params.red, params.green, params.blue);
  }, 50);

  const fns = {
    reset: () => {
      params.red = 1;
      params.green = 1;
      params.blue = 1;
      onChange();
    }
  }

  gui.add(params, 'red', 0, 3).onChange(onChange).listen();
  gui.add(params, 'green', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(params, 'blue', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(fns, 'reset');

  return [gui, onChange];
}

function setupHSVGui(params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    params.kernel(params.image, params.hue, params.saturation, params.value);
  }, 50);

  const fns = {
    reset: () => {
      params.hue = 0;
      params.saturation = 1;
      params.value = 1;
      onChange();
    }
  }

  gui.add(params, 'hue', -180, 180).onChange(onChange).listen();
  gui.add(params, 'saturation', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(params, 'value', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(fns, 'reset');

  return [gui, onChange];
}

function setupCMYKGui(params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    params.kernel(params.image, params.cyan, params.magenta, params.yellow, params.key);
  }, 50);

  const fns = {
    reset: () => {
      params.cyan = 1;
      params.magenta = 1;
      params.yellow = 1;
      params.key = 1;
      onChange();
    }
  }

  gui.add(params, 'cyan', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(params, 'magenta', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(params, 'yellow', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(params, 'key', 0, 3).step(0.01).onChange(onChange).listen();
  gui.add(fns, 'reset');

  return [gui, onChange];
}

async function createPage(setupKernel, setupGui, createParams) {
  const image = await randomImage();
  const kernel = setupKernel(image);

  const params = createParams(image, kernel);

  const [gui, onChange] = setupGui(params);

  // Attach events to the 'Choose Image' button
  uploadImage((img) => {
    removeElement(params.kernel.canvas);
    params.image = img;
    params.kernel = setupKernel(img);
    onChange();
  });

  // Attach events to the 'Random Image' Button
  document.getElementById('random-btn').onclick = async () => {
    removeElement(params.kernel.canvas);
    const img = await randomImage();
    params.image = img;
    params.kernel = setupKernel(img);
    onChange();
  }

  document.getElementById('download-btn').onclick = () => {
    saveImage(params.kernel.canvas);
  }

  onChange();
}

createPage(setupRGBKernel, setupRGBGui, rgbParams);
// createPage(setupHSVKernel, setupHSVGui, hsvParams);
// createPage(setupCMYKKernel, setupCMYKGui, cmykParams);