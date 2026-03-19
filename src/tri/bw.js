'use strict';

/**
 * Bowyer–Watson Delaunay Triangulation.
 *
 * Step types:
 *   {type:'insert',   point, bad, polygon, tris} — inserting a point
 *   {type:'done',     edges}
 */
function bowyer_watson() {
  const pts = state.points;
  state.steps = [];

  const bb = boundingBox(pts);
  const dx = bb.maxX - bb.minX, dy = bb.maxY - bb.minY;
  const delta = Math.max(dx, dy) * 100;

  // Super-triangle vertices (well outside all points)
  const p1 = { x: bb.minX - delta,     y: bb.minY - delta };
  const p2 = { x: bb.minX - delta,     y: bb.maxY + delta * 2 };
  const p3 = { x: bb.maxX + delta * 2, y: bb.minY - delta };
  const superVerts = [p1, p2, p3];

  let tris = [{ a: p1, b: p2, c: p3 }];

  for (const p of pts) {
    const bad = tris.filter(t => inCircumcircle(p, t));

    // Build boundary polygon of bad triangles
    const polygon = [];
    for (const tri of bad) {
      for (const edge of triEdges(tri)) {
        const shared = bad.some(
          other => other !== tri && triEdges(other).some(oe => sameEdge(edge, oe))
        );
        if (!shared) polygon.push(edge);
      }
    }

    tris = tris.filter(t => !bad.includes(t));
    for (const e of polygon) tris.push({ a: e.a, b: e.b, c: p });

    state.steps.push({ type: 'insert', point: p, bad, polygon, tris: tris.slice() });
  }

  // Remove triangles touching super-triangle vertices
  tris = tris.filter(t =>
    !superVerts.some(sv => samePoint(t.a, sv) || samePoint(t.b, sv) || samePoint(t.c, sv))
  );

  // Deduplicate edges
  const edgeMap = new Map();
  for (const tri of tris) {
    for (const e of triEdges(tri)) {
      const key = [
        Math.min(e.a.x, e.b.x), Math.min(e.a.y, e.b.y),
        Math.max(e.a.x, e.b.x), Math.max(e.a.y, e.b.y),
      ].join(',');
      if (!edgeMap.has(key)) edgeMap.set(key, e);
    }
  }

  state.steps.push({ type: 'done', edges: [...edgeMap.values()] });
}

function triEdges(t) {
  return [{ a: t.a, b: t.b }, { a: t.b, b: t.c }, { a: t.c, b: t.a }];
}

function inCircumcircle(p, tri) {
  const ax = tri.a.x - p.x, ay = tri.a.y - p.y;
  const bx = tri.b.x - p.x, by = tri.b.y - p.y;
  const cx = tri.c.x - p.x, cy = tri.c.y - p.y;
  const det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);
  const orient = cross2d(tri.a, tri.b, tri.c);
  return det * orient > 0;
}
