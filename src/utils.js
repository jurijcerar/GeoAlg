'use strict';

// Geometry prims (replace p5.js)

function cross2d(p, q, r) {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function dist2d(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function distToLine(a, b, p) {
  return Math.abs(cross2d(a, b, p));
}

function side(a, b, p) {
  const v = cross2d(a, b, p);
  return v > 0 ? 1 : v < 0 ? -1 : 0;
}

function samePoint(p, q) {
  return p.x === q.x && p.y === q.y;
}

function sameEdge(e1, e2) {
  return (samePoint(e1.a, e2.a) && samePoint(e1.b, e2.b)) ||
         (samePoint(e1.a, e2.b) && samePoint(e1.b, e2.a));
}

function segmentsIntersect(a, b, c, d) {
  const o1 = cross2d(a, b, c);
  const o2 = cross2d(a, b, d);
  const o3 = cross2d(c, d, a);
  const o4 = cross2d(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

function crossesAny(candidate, edges) {
  for (const e of edges) {
    if (candidate.a === e.a || candidate.a === e.b ||
        candidate.b === e.a || candidate.b === e.b) continue;
    if (segmentsIntersect(candidate.a, candidate.b, e.a, e.b)) return true;
  }
  return false;
}

function boundingBox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

function randomGaussian(mean, std) {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
