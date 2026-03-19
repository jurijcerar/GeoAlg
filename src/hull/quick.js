'use strict';

/**
 * Quick Hull.
 *
 * Step types recorded:
 *   {type:'split',  a, b, region}          — considering this set of points
 *   {type:'apex',   a, b, c, region}       — farthest point chosen
 *   {type:'edge',   a, b, depth}           — hull edge confirmed
 *   {type:'done',   hull}
 */
function quick_hull() {
  const pts = state.points;
  if (pts.length < 3) return;

  state.steps = [];

  // Find leftmost and rightmost points
  const minX = pts.reduce((a, b) => a.x < b.x ? a : b);
  const maxX = pts.reduce((a, b) => a.x > b.x ? a : b);

  const hullSet = [minX, maxX];

  // Split into upper and lower halves
  const upper = pts.filter(p => p !== minX && p !== maxX && side(minX, maxX, p) === 1);
  const lower = pts.filter(p => p !== minX && p !== maxX && side(minX, maxX, p) === -1);

  state.steps.push({ type: 'split', a: minX, b: maxX, region: upper });
  findHullSteps(upper, minX, maxX, 0, hullSet);

  state.steps.push({ type: 'split', a: maxX, b: minX, region: lower });
  findHullSteps(lower, maxX, minX, 0, hullSet);

  // Build final ordered hull
  const done = buildOrderedHull(hullSet, minX, maxX, pts);
  state.steps.push({ type: 'done', hull: done });
}

function findHullSteps(subset, a, b, depth, hullSet) {
  if (!subset.length) {
    state.steps.push({ type: 'edge', a, b, depth });
    return;
  }

  // Find farthest point from line a–b
  let maxDist = -1, apex = null;
  for (const p of subset) {
    const d = distToLine(a, b, p);
    if (d > maxDist) { maxDist = d; apex = p; }
  }

  hullSet.push(apex);
  state.steps.push({ type: 'apex', a, b, c: apex, region: subset, depth });

  const leftOfAC = subset.filter(p => p !== apex && side(a, apex, p) === 1);
  const leftOfCB = subset.filter(p => p !== apex && side(apex, b, p) === 1);

  findHullSteps(leftOfAC, a, apex, depth + 1, hullSet);
  findHullSteps(leftOfCB, apex, b, depth + 1, hullSet);
}

function buildOrderedHull(hullSet, minX, maxX, allPts) {
  // Sort hull points by angle from centroid
  const cx = hullSet.reduce((s, p) => s + p.x, 0) / hullSet.length;
  const cy = hullSet.reduce((s, p) => s + p.y, 0) / hullSet.length;
  return hullSet.slice().sort((a, b) =>
    Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );
}
