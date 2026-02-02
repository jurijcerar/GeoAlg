
function even_dist() {
  state.points = [];

  const n = +document.getElementById("numPoints").value;

  for (let i = 0; i < n; i++) {
    let p = createVector(random(width), random(height));
    state.points.push(p);
  }
}

function gauss_dist() {
  state.points = [];

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

function draw_points() {
  stroke('red');
  strokeWeight(4);
  for (let p of state.points) {
    point(p.x, p.y);
  }
}
