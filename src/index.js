import './style.scss';
import { GPU } from 'gpu.js';
import dat from 'dat.gui';
import throttle from 'lodash.throttle';
import Navigo from 'navigo';
import { rgbKernel, hsv2rgb, rgb2hsv, hsvKernel, rgb2cmyk, cmyk2rgb, cmykKernel } from './kernels';
import { createCanvas, saveImage, uploadImage, removeElement, randomImage } from './utils';

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

function createRGBParams() {
  return {
    red: 1,
    green: 1,
    blue: 1
  };
}

function createHSVParams() {
  return {
    hue: 0,
    saturation: 1,
    value: 1
  };
}

function createCMYKParams() {
  return {
    cyan: 1,
    yellow: 1,
    magenta: 1,
    key: 1
  };
}

function setupRGBGui(kernel, params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    kernel(params.image, params.red, params.green, params.blue);
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

function setupHSVGui(kernel, params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    kernel(params.image, params.hue, params.saturation, params.value);
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

function setupCMYKGui(kernel, params) {
  const gui = new dat.GUI();

  const onChange = throttle(() => {
    kernel(params.image, params.cyan, params.magenta, params.yellow, params.key);
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

const RGB = 'RGB';
const HSV = 'HSV';
const CMYK = 'CMYK';

function setupKernel(mode, image) {
  if (mode === RGB) {
    return setupRGBKernel(image);
  } else if (mode === HSV) {
    return setupHSVKernel(image);
  } else if (mode === CMYK) {
    return setupCMYKKernel(image);
  } else {
    throw new Error('No color mode defined');
  }
}

function setupGui(mode, kernel, params) {
  if (mode === RGB) {
    return setupRGBGui(kernel, params);
  } else if (mode === HSV) {
    return setupHSVGui(kernel, params);
  } else if (mode === CMYK) {
    return setupCMYKGui(kernel, params);
  } else {
    throw new Error('No color mode defined');
  }
}

(async () => {
  const router = new Navigo(null);

  let image = await randomImage();
  let kernel, gui, onChange, mode;

  const rgbParams = createRGBParams();
  const hsvParams = createHSVParams();
  const cmykParams = createCMYKParams();

  function setImage(img) {
    rgbParams.image = img;
    hsvParams.image = img;
    cmykParams.image = img;
  }

  setImage(image);

  function onKernelChange() {
    if (kernel) {
      removeElement(kernel.canvas);
    }
    if (gui) {
      gui.destroy();
    }
  }

  function getParams(colorMode) {
    if (colorMode === RGB) {
      return rgbParams;
    } else if (colorMode === HSV) {
      return hsvParams;
    } else if (colorMode === CMYK) {
      return cmykParams;
    } else {
      throw new Error('No color mode defined');
    }
  }

  const activateLink = (() => {
    const rgb = document.getElementById('rgbLink')
    const hsv = document.getElementById('hsvLink');
    const cmyk = document.getElementById('cmykLink');
    return (mode) => {
      if (mode === RGB) {
        rgb.classList.add('active');
        hsv.classList.remove('active');
        cmyk.classList.remove('active');
      } else if (mode === HSV) {
        rgb.classList.remove('active');
        hsv.classList.add('active');
        cmyk.classList.remove('active');
      } else if (mode === CMYK) {
        rgb.classList.remove('active');
        hsv.classList.remove('active');
        cmyk.classList.add('active');
      } else {
        rgb.classList.remove('active');
        hsv.classList.remove('active');
        cmyk.classList.remove('active');
      }
    }
  })();

  router.on({
    '/': () => {
      mode = RGB;
      activateLink(mode);
      onKernelChange();
      kernel = setupKernel(mode, image);
      [gui, onChange] = setupGui(mode, kernel, getParams(mode));
      onChange();
    },
    '/rgb': () => {
      mode = RGB;
      activateLink(mode);
      onKernelChange();
      kernel = setupKernel(mode, image);
      [gui, onChange] = setupGui(mode, kernel, getParams(mode));
      onChange();
    },
    '/hsv': () => {
      mode = HSV;
      activateLink(mode);
      onKernelChange();
      kernel = setupKernel(mode, image);
      [gui, onChange] = setupGui(mode, kernel, getParams(mode));
      onChange();
    },
    '/cmyk': () => {
      mode = CMYK;
      activateLink(mode);
      onKernelChange();
      kernel = setupKernel(mode, image);
      [gui, onChange] = setupGui(mode, kernel, getParams(mode));
      onChange();
    }
  });
  router.resolve();

  // Attach events to the 'Choose Image' button
  uploadImage((img) => {
    setImage(img);
    onKernelChange();
    kernel = setupKernel(mode, image);
    [gui, onChange] = setupGui(mode, kernel, getParams(mode));
    onChange();
  });

  // Attach events to the 'Random Image' Button
  document.getElementById('random-btn').onclick = async () => {
    const image = await randomImage();
    setImage(image);
    onKernelChange();
    kernel = setupKernel(mode, image);
    [gui, onChange] = setupGui(mode, kernel, getParams(mode));
    onChange();
  }

  document.getElementById('download-btn').onclick = () => {
    saveImage(kernel.canvas);
  }
})();