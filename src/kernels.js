export const rgbKernel = `function rgbKernel(image, redMult, greenMult, blueMult) {
  const pixel = image[this.thread.y][this.thread.x];
  const red = pixel[0];
  const green = pixel[1];
  const blue = pixel[2];

  const r = red * redMult;
  const g = green * greenMult;
  const b = blue * blueMult;

  this.color(r, g, b, pixel[3]);
}`

export const rgb2hsv = `function rgb2hsv(red, green, blue) {
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
}`;

export const hsv2rgb = `function hsv2rgb(hue, sat, val) {
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
}`;

export const hsvKernel = `function hsvKernel(image, hueRot, saturationMult, valueMult) {
  const pixel = image[this.thread.y][this.thread.x];
  const red = pixel[0];
  const green = pixel[1];
  const blue = pixel[2];

  let [hue, sat, val] = rgb2hsv(red, green, blue);

  hue = (hue + hueRot + 360) % 360;
  sat = sat * saturationMult;
  val = val * valueMult;

  // Now change back to RGB
  let [r, g, b] = hsv2rgb(hue, sat, val);
  this.color(r, g, b, pixel[3]);
}`;

/**
 * 
 * @param {Number} red - number in range 0 to 1.
 * @param {Number} green - number in range 0 to 1.
 * @param {Number} blue - number in range 0 to 1.
 */
export const rgb2cmyk = `function rgb2cmyk(red, green, blue) {
  const k = 1 - Math.max(red, Math.max(green, blue));
  const c = (1 - red - k) / (1 - k);
  const m = (1 - green - k) / (1 - k);
  const y = (1 - blue - k) / (1 - k);
  return [c, m, y, k];
}`;

export const cmyk2rgb = `function cmyk2rgb(cyan, magenta, yellow, black) {
  const r = (1 - cyan) * (1 - black);
  const g = (1 - magenta) * (1 - black);
  const b = (1 - yellow) * (1 - black);
  return [r, g, b];
}`;

export const cmykKernel = `function cmykKernel(image, cm, mm, ym, bm) {
  const pixel = image[this.thread.y][this.thread.x];
  const red = pixel[0];
  const green = pixel[1];
  const blue = pixel[2];

  let [cyan, magenta, yellow, black] = rgb2cmyk(red, green, blue);

  cyan = Math.min(cyan * cm, 1);
  magenta = Math.min(magenta * mm, 1);
  yellow = Math.min(yellow * ym, 1);
  black = Math.min(black * bm, 1);

  // Now change back to RGB
  const [r, g, b] = cmyk2rgb(cyan, magenta, yellow, black);
  this.color(r, g, b, pixel[3]);
}`;