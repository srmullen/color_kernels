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

export const hsvKernel = `function hsvKernel(image, hueRot, saturationOffset, valueOffset) {
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
  this.color(r, g, b, pixel[3]);
}`;