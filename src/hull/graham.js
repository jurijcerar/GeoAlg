'use strict';

/**
 * Graham Scan.
 *
 * Step types recorded:
 *   {type:'sort',   pivot, sorted}         — initial polar sort result
 *   {type:'push',   stack, point}          — point added to stack
 *   {type:'pop',    stack, removed}        — point popped (non-left turn)
 *   {type:'edge',   a, b}                  — candidate edge from top two
 *   {type:'done',   hull}
 */
function grahams_scan() {
  const pts = [...state.points];
  if (pts.length < 3) return;

  state.steps = [];

  // Sort by lowest Y (then leftmost X) to find pivot
  pts.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
  const pivot = pts[0];

  // Sort remaining by polar angle from pivot
  const rest = pts.slice(1).sort((a, b) => {
    const angA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
    const angB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
    if (Math.abs(angA - angB) > 1e-9) return angA - angB;
    return dist2d(pivot, a) - dist2d(pivot, b);
  });

  const sorted = [pivot, ...rest];
  state.steps.push({ type: 'sort', pivot, sorted: sorted.slice() });

  const stack = [sorted[0], sorted[1]];
  state.steps.push({ type: 'push', stack: stack.slice(), point: sorted[1] });

  for (let i = 2; i < sorted.length; i++) {
    const p = sorted[i];

    // Pop while not making a left turn
    while (
      stack.length > 1 &&
      cross2d(stack[stack.length - 2], stack[stack.length - 1], p) <= 0
    ) {
      const removed = stack.pop();
      state.steps.push({ type: 'pop', stack: stack.slice(), removed });
    }

    stack.push(p);
    state.steps.push({
      type: 'push',
      stack: stack.slice(),
      point: p,
      edge: stack.length >= 2 ? { a: stack[stack.length - 2], b: p } : null,
    });
  }

  state.steps.push({ type: 'done', hull: stack.slice() });
}
