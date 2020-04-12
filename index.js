import './style.scss';
import { GPU } from 'gpu.js';
import dat from 'dat.gui';
import throttle from 'lodash.throttle';
import { hsv2rgb, rgb2hsv, hsvKernel } from './kernels';
import { loadImage, createCanvas, saveImage, uploadImage, removeElement } from './utils';

function setupKernel(image) {
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

(async () => {
  const url = 'https://source.unsplash.com/random';
  let image = await loadImage(url);

  let kernel = setupKernel(image);

  const gui = new dat.GUI();

  const hsv = {
    hue: 0,
    saturation: 0,
    value: 0
  };

  // Attach events to the 'Choose Image' button
  uploadImage((img) => {
    image = img;
    removeElement(kernel.canvas);
    kernel = setupKernel(image);
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  });

  // Attach events to the 'Random Image' Button
  document.getElementById('random-btn').onclick = async () => {
    removeElement(kernel.canvas);
    image = await loadImage(url);
    kernel = setupKernel(image);
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  }

  const fns = {
    download: () => saveImage(kernel.canvas)
  }

  const onChange = throttle(() => {
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  }, 50);

  gui.add(hsv, 'hue', 0, 360).onChange(onChange);
  gui.add(hsv, 'saturation', -1, 1).step(0.01).onChange(onChange);
  gui.add(hsv, 'value', -1, 1).step(0.01).onChange(onChange);
  gui.add(fns, 'download');

  kernel(image, hsv.hue, hsv.saturation, hsv.value);
})();