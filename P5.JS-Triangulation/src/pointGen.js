function create_point(p){ 
  points.push(p);
  strokeWeight(4);
  stroke('red');
  point(p.x,p.y);
}

function even_dist() {
  clear();
  points = [];

  const n = +document.getElementById("numPoints").value;

  for (let i = 0; i < n; i++) {
    let p = createVector(random(width), random(height));
    create_point(p);
  }
}

function gauss_dist() {
  clear();
  points = [];

  const n = +document.getElementById("numPoints").value;

  for (let i = 0; i < n; i++) {
    let p = createVector(
      randomGaussian(width / 2, 70),
      randomGaussian(height / 2, 70)
    );
    if (p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
      create_point(p);
    } else i--;
  }
}
