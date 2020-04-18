import cryptoRandomString from 'crypto-random-string';

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

export function uploadImage(onload, onerror) {
  window.addEventListener('load', function () {
    document.querySelector('input[type="file"]').addEventListener('change', function () {
      if (this.files && this.files[0]) {
        var img = document.querySelector('img');  // $('img')[0]
        img.src = URL.createObjectURL(this.files[0]); // set src to blob url
        img.hidden = true;
        img.onload = () => {
          onload(img);
        };
        img.onerror = onerror;
        document.body.appendChild(img);
      }
    });
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

export function removeElement(el) {
  el.parentNode.removeChild(el);
}

export function unsplashUrl(user, image) {
  return `https://source.unsplash.com/user/${user}/${image}`;
}

export function randomImage() {
  // const url = `https://source.unsplash.com/random?_=${cryptoRandomString({ length: 6 })}`;
  const url = `https://picsum.photos/1333/1000?_=${cryptoRandomString({ length: 6 })}`;
  return loadImage(url);
}