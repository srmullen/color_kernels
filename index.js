import './style.scss';
import { GPU } from 'gpu.js';
import dat from 'dat.gui';

function createCanvas(
  [width, height], 
  { hidden = false, el=document.body, id, style, className } = {}
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  if (style) {
    canvas.style = style;
  }
  if (className) {
    canvas.className = className;
  }
  canvas.hidden = hidden;
  if (id) {
    canvas.id = id;
  }
  el.appendChild(canvas);

  return canvas;
}

function loadImage(src, { hidden = true } = {}) {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.crossOrigin = 'Anonymous'; // To avoid tainted canvas
    image.src = src;
    image.hidden = hidden;
    image.onload = () => resolve(image);
    document.body.appendChild(image);
  });
}

function rgb2hsv(red, green, blue) {
  const cmax = Math.max(Math.max(red, green), blue);
  const cmin = Math.min(Math.min(red, green), blue);
  const delta = cmax - cmin;

  let hue = 0;
  if (delta === 0) {
    // hue is 0
  } else if (cmax === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (cmax === green) {
    hue = 60 * (((blue - red) / delta) + 2)
  } else if (cmax === blue) {
    hue = 60 * (((red - green) / delta) + 4)
  }

  let sat = 0
  if (cmax === 0) {
    // sat is 0
  } else {
    sat = delta / cmax
  }

  const val = cmax;

  return [hue, sat, val];
}

function hsv2rgb(hue, sat, val) {
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (0 <= hue && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= hue && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= hue && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= hue && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= hue && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return [r + m, g + m, b + m];
}

function hsvKernel(image, hueRot, saturationOffset, valueOffset) {
  const pixel = image[this.thread.y][this.thread.x];
  const red = pixel[0];
  const green = pixel[1];
  const blue = pixel[2];
  
  let [hue, sat, val] = rgb2hsv(red, green, blue);

  hue = (hue + hueRot) % 360;
  sat = Math.max(0, Math.min(1, sat + saturationOffset));
  val = Math.max(0, Math.min(1, val + valueOffset));

  // Now change back to RGB
  let [r, g, b] = hsv2rgb(hue, sat, val);
  this.color(r, g, b);
}

function unsplashUrl(user, image) {
  return `https://source.unsplash.com/user/${user}/${image}`;
}

(async () => {
  // const url = unsplashUrl('gregoryallen', '2TkHWpyHhJM');
  // const url = unsplashUrl('z734923105', 'SJGiS1JzUCc');
  const url = 'https://source.unsplash.com/random';
  const image = await loadImage(url);

  const canvasContainer = document.getElementById('canvas-container');
  const canvas = createCanvas([image.width, image.height], { 
    el: canvasContainer,
    style: 'max-height: 80vh; max-width: 100%;'
  });

  const gpu = new GPU({
    canvas
  });

  gpu.addFunction(rgb2hsv);
  gpu.addFunction(hsv2rgb);

  const kernel = gpu.createKernel(hsvKernel, {
    graphical: true,
    output: [image.width, image.height]
  });

  const gui = new dat.GUI();

  const hsv = {
    hue: 0,
    saturation: 0,
    value: 0
  };

  gui.add(hsv, 'hue', -180, 180).onChange(() => {
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  });
  gui.add(hsv, 'saturation', -1, 1).step(0.01).onChange(() => {
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  });
  gui.add(hsv, 'value', -1, 1).step(0.01).onChange(() => {
    kernel(image, hsv.hue, hsv.saturation, hsv.value);
  });

  kernel(image, hsv.hue, hsv.saturation, hsv.value);
})();