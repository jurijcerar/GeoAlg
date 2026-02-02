
function even_dist() {
  state.points = [];
  state.edges = [];
state.slider.value(0);
  const n = +document.getElementById("numPoints").value;

  for (let i = 0; i < n; i++) {
    let p = createVector(random(width), random(height));
    state.points.push(p);
  }
}

function gauss_dist() {
  state.points = [];
  state.edges = [];
state.slider.value(0);
  const n = +document.getElementById("numPoints").value;

  for (let i = 0; i < n; i++) {
    let p = createVector(
      randomGaussian(width / 2, 70),
      randomGaussian(height / 2, 70)
    );
    if (p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
      state.points.push(p);
    } else i--;
  }
}

