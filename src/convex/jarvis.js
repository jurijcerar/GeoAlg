

function triplet_orientation(p, q, r) {
  return p5.Vector
    .cross(q.copy().sub(p), r.copy().sub(p))
    .z;
}

function jarvis_march() {

  if (state.points.length < 3) return;
  hull = [];

  // leftmost point
  let start = state.points.reduce((a, b) =>
    a.x < b.x ? a : b
  );

  let current = start;

  do {
    hull.push(current.copy());
    let next = state.points[0];

    for (let i = 1; i < state.points.length; i++) {
      if (next === current) {
        next = state.points[i];
        continue;
      }

      let cross = triplet_orientation(current, next, state.points[i]);

      // choose most counterclockwise
      if (cross < 0 ||
        (cross === 0 &&
          euk_dist(current, state.points[i]) >
          euk_dist(current, next))) {
        next = state.points[i];
      }
    }

    addEdge(current, next);

    current = next;

  } while (!current.equals(start));
}