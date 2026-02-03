function equals(a, b) {
  return abs(a - b) < 1e-9;
}

function addEdge(a, b) {
    state.edges.push({ a: a, b: b });
    //console.log(`Edge added: (${a.x},${a.y}) -> (${b.x},${b.y})`);
}

function draw_points() {
  stroke('red');
  strokeWeight(4);
  for (let p of state.points) {
    point(p.x, p.y);
  }
}

function euk_dist(a, b) {
  return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

function distance_compare(a,b){
  return euk_dist(a.a,a.b) - euk_dist(b.a,b.b);
}

function orient(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function segmentsIntersect(a, b, c, d) {
  let o1 = orient(a, b, c);
  let o2 = orient(a, b, d);
  let o3 = orient(c, d, a);
  let o4 = orient(c, d, b);

  return o1 * o2 < 0 && o3 * o4 < 0;
}

function check_crossing(candidate, triangulation) {
  for (let e of triangulation) {

    if (
      candidate.a === e.a ||
      candidate.a === e.b ||
      candidate.b === e.a ||
      candidate.b === e.b
    ) continue;

    if (segmentsIntersect(candidate.a, candidate.b, e.a, e.b)) {
      return false;
    }
  }
  return true;
}

function distToLine(a, b, p) {
  return abs(p5.Vector.cross(b.copy().sub(a), p.copy().sub(a)).z);
}

function side(a, b, p) {
  let val = p5.Vector.cross(b.copy().sub(a), p.copy().sub(a)).z;
  if (val > 0) return 1;
  if (val < 0) return -1;
  return 0;
}
