export function createCanvas(
  [width, height],
  { hidden = false, el = document.body, id, style, className } = {}
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

export function loadImage(src, { hidden = true } = {}) {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.crossOrigin = 'Anonymous'; // To avoid tainted canvas
    image.src = src;
    image.hidden = hidden;
    image.onload = () => resolve(image);
    document.body.appendChild(image);
  });
}

export function saveImage(canvas) {
  const img = canvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.setAttribute('download', 'colorkernel.jpeg');
  link.href = img;
  link.style = 'display: none';
  document.body.appendChild(link);
  link.click();
}

export function unsplashUrl(user, image) {
  return `https://source.unsplash.com/user/${user}/${image}`;
}