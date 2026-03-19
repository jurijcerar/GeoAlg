'use strict';

function even_dist() {
  const n   = Math.max(3, +document.getElementById('numPoints').value);
  const cvs = document.getElementById('main-canvas');
  state.points = [];
  for (let i = 0; i < n; i++) {
    state.points.push({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
    });
  }
  recompute();
}

function gauss_dist() {
  const n   = Math.max(3, +document.getElementById('numPoints').value);
  const cvs = document.getElementById('main-canvas');
  state.points = [];
  let attempts = 0;
  while (state.points.length < n && attempts < n * 20) {
    attempts++;
    const x = randomGaussian(cvs.width  / 2, cvs.width  * 0.13);
    const y = randomGaussian(cvs.height / 2, cvs.height * 0.13);
    if (x >= 10 && x <= cvs.width - 10 && y >= 10 && y <= cvs.height - 10) {
      state.points.push({ x, y });
    }
  }
  recompute();
}
