function jarvis_march() {
  hull = [];

  // leftmost point
  let start = points.reduce((a, b) =>
    a.x < b.x ? a : b
  );

  let current = start;

  do {
    hull.push(current.copy());
    let next = points[0];

    for (let i = 1; i < points.length; i++) {
      if (next === current) {
        next = points[i];
        continue;
      }

      let cross = orientation(current, next, points[i]);

      // choose most counterclockwise
      if (cross < 0 ||
        (cross === 0 &&
          euk_dist(current, points[i]) >
          euk_dist(current, next))) {
        next = points[i];
      }
    }

    current = next;

  } while (!current.equals(start));
}


function grahangle(a, b) {
  var a = atan2(a.y - b.y, a.x - b.x);
  if (a < 0) {
    a = a + 2 * PI;
  }
  return a;
}

function grahamsort(a, b) {
  let angA = grahangle(a, points[0]);
  let angB = grahangle(b, points[0]);

  if (!equals(angA, angB)) return angA - angB;
  return euk_dist(points[0], a) - euk_dist(points[0], b);
}


function grahams_scan() {
  hull = [];
  points.sort((a, b) =>
    a.y === b.y ? a.x - b.x : a.y - b.y
  );

  var temp1 = points.slice(1);
  var temp2 = points.slice(0, 1);
  temp1.sort(grahamsort);
  points = temp2.concat(temp1);
  hull.push(points[0].copy());
  hull.push(points[1].copy());
  hull.push(points[2].copy());

  for (var i = 3; i < points.length; i++) {
    var p1 = hull[hull.length - 2].copy();
    var p2 = hull[hull.length - 1].copy();
    var p3 = points[i].copy();
    var U = p5.Vector
      .cross(p2.copy().sub(p1), p3.copy().sub(p1))
      .z;

    if (U <= 0) {
      while (
        hull.length > 1 &&
        p5.Vector.cross(
          hull[hull.length - 1].copy().sub(hull[hull.length - 2]),
          points[i].copy().sub(hull[hull.length - 2])
        ).z <= 0
      ) {
        hull.pop();
      }

    }
    hull.push(p3);
  }
}

function find_hull(pointsSubset, a, b) {
  if (!pointsSubset.length) return;

  // 1️⃣ Find farthest point from line a-b
  let maxDist = -1;
  let c = null;
  for (let p of pointsSubset) {
    let d = distToLine(a, b, p);
    if (d > maxDist) {
      maxDist = d;
      c = p;
    }
  }

  // 2️⃣ Insert c between a and b in hull
  let idx = hull.indexOf(b);
  hull.splice(idx, 0, c);

  // 3️⃣ Split remaining points into two subsets relative to new segments
  let leftSet = [];
  let rightSet = [];
  for (let p of pointsSubset) {
    if (p === c) continue;

    if (side(a, c, p) === 1) leftSet.push(p);
    else if (side(c, b, p) === 1) rightSet.push(p);
  }

  // 4️⃣ Recurse
  find_hull(leftSet, a, c);
  find_hull(rightSet, c, b);
}

function quick_hull() {
  hull = [];

  // Find leftmost and rightmost points
  let minX = points[0];
  let maxX = points[0];
  for (let p of points) {
    if (p.x < minX.x) minX = p;
    if (p.x > maxX.x) maxX = p;
  }

  hull.push(minX);
  hull.push(maxX);

  // Split points into two sets: above and below line
  let leftSet = [];
  let rightSet = [];
  for (let p of points) {
    if (p === minX || p === maxX) continue;

    if (side(minX, maxX, p) === 1) leftSet.push(p);
    else if (side(minX, maxX, p) === -1) rightSet.push(p);
  }

  find_hull(leftSet, minX, maxX);
  find_hull(rightSet, maxX, minX);

  return hull; // ordered convex hull
}