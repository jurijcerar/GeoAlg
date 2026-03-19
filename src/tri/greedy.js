'use strict';

/**
 * Greedy Triangulation.
 * Sorts all O(n²) edges by length and adds them if they don't cross existing ones.
 *
 * Step types:
 *   {type:'candidate', edge, accepted}     — tried an edge
 *   {type:'done', edges}
 */
function greedy_triangulation() {
  const pts = state.points;
  state.steps = [];

  // Generate all pairs, sort by length
  const candidates = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      candidates.push({ a: pts[i], b: pts[j] });

  candidates.sort((p, q) => dist2d(p.a, p.b) - dist2d(q.a, q.b));

  const accepted = [];
  for (const edge of candidates) {
    const ok = !crossesAny(edge, accepted);
    state.steps.push({ type: 'candidate', edge, accepted: accepted.slice(), ok });
    if (ok) accepted.push(edge);
  }

  state.steps.push({ type: 'done', edges: accepted });
}
