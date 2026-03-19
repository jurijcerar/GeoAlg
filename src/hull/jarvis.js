'use strict';

/**
 * Jarvis March (Gift Wrapping).
 *
 * Step types recorded:
 *   {type:'ray',    from, scanning, best}  — current pivot scanning candidates
 *   {type:'edge',   a, b}                  — hull edge confirmed
 *   {type:'done',   hull}                  — final polygon
 */
function jarvis_march() {
  const pts = state.points;
  if (pts.length < 3) return;

  state.steps = [];
  const hull = [];

  // Leftmost point as starting anchor
  const start = pts.reduce((a, b) => a.x < b.x ? a : b);
  let current = start;

  do {
    hull.push(current);
    let best = null;

    for (const candidate of pts) {
      if (candidate === current) continue;

      if (best === null) {
        best = candidate;
        continue;
      }

      const c = cross2d(current, best, candidate);

      // Record a scanning ray step every time we find a better candidate
      if (c < 0 || (c === 0 && dist2d(current, candidate) > dist2d(current, best))) {
        state.steps.push({ type: 'ray', from: current, scanning: candidate, best });
        best = candidate;
      } else {
        state.steps.push({ type: 'ray', from: current, scanning: candidate, best });
      }
    }

    state.steps.push({ type: 'edge', a: current, b: best });
    current = best;

  } while (current !== start);

  state.steps.push({ type: 'done', hull });
}
