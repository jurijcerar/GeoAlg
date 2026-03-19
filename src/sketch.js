'use strict';

// Canvas setup and main draw loop, plus UI wiring and playback control.

const canvas = document.getElementById('main-canvas');
const ctx    = canvas.getContext('2d');

function toolbarHeight() {
  const toolbar = document.getElementById('mobile-toolbar');
  if (!toolbar || window.innerWidth > 700) return 0;
  return toolbar.offsetHeight;
}

function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  canvas.width  = container.clientWidth;
  canvas.height = container.clientHeight - toolbarHeight();
  draw();
}

window.addEventListener('resize', resizeCanvas);

// Themes

const PALETTE = {
  bg:       '#0d0f12',
  point:    '#c8d0e0',
  dimPoint: '#2a3040',
  jarvis:   '#f97316',
  graham:   '#22d3ee',
  quick:    '#a78bfa',
  greedy:   '#4ade80',
  bw:       '#fb7185',
};

function algoColor() {
  if (state.mode === 'hull') {
    return PALETTE[state.hullAlgo] ?? PALETTE.jarvis;
  }
  return PALETTE[state.triAlgo] ?? PALETTE.greedy;
}

// Playback control

let currentStep  = 0;
let playTimer    = null;
const PLAY_INTERVAL_MS = 25;   // ms between auto-advance steps

function playbackAt(idx) {
  currentStep = Math.max(0, Math.min(idx, state.steps.length - 1));
  const slider = document.getElementById('stepSlider');
  slider.value = currentStep;
  updateStepCount();
  draw();
}

function updateStepCount() {
  const el = document.getElementById('step-count');
  if (!state.steps.length) { el.textContent = '—'; return; }
  el.textContent = `${currentStep + 1} / ${state.steps.length}`;
}

function stopPlay() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  document.getElementById('playBtn').textContent = '▶ Play';
}

function startPlay() {
  if (currentStep >= state.steps.length - 1) currentStep = 0;
  document.getElementById('playBtn').textContent = '⏹ Stop';
  playTimer = setInterval(() => {
    if (currentStep >= state.steps.length - 1) { stopPlay(); return; }
    playbackAt(currentStep + 1);
  }, PLAY_INTERVAL_MS);
}

// Draw loop

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!state.points.length) return;

  if (state.mode === 'none' || !state.steps.length) {
    drawPoints(state.points);
    return;
  }

  if (state.mode === 'hull')  drawHullStep(currentStep);
  if (state.mode === 'tri')   drawTriStep(currentStep);
}

// Background grid

function drawBackground() {
  ctx.strokeStyle = 'rgba(30,35,44,0.8)';
  ctx.lineWidth = 1;
  const gs = 40;
  for (let x = 0; x < canvas.width;  x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}

// Drawing primitives

function drawPoints(pts, color = PALETTE.point, size = 3.5) {
  ctx.fillStyle = color;
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPoint(p, color, size = 5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawEdge(a, b, color, alpha = 1, width = 1.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawPolygon(pts, color, fillAlpha = 0.08, strokeAlpha = 1) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fill();
  ctx.globalAlpha = strokeAlpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

// Step renderers

function drawHullStep(idx) {
  const step = state.steps[idx];
  const color = algoColor();

  // Collect edges confirmed so far
  const confirmedEdges = [];
  let doneHull = null;
  let sortedPts = null;
  let stackPts  = null;

  for (let i = 0; i <= idx; i++) {
    const s = state.steps[i];
    if (s.type === 'edge')  confirmedEdges.push({ a: s.a, b: s.b });
    if (s.type === 'done')  doneHull = s.hull;
    if (s.type === 'sort')  sortedPts = s.sorted;
    if (s.type === 'push')  stackPts  = s.stack;
    if (s.type === 'pop')   stackPts  = s.stack;
  }

  // Jarvis: show scanning ray, best candidate, and confirmed edges as they go in
  if (state.hullAlgo === 'jarvis') {
    drawPoints(state.points, PALETTE.dimPoint);

    // Draw confirmed hull edges
    for (const e of confirmedEdges) drawEdge(e.a, e.b, color, 1, 2);

    if (step.type === 'ray') {
      // Dim scanning ray to current candidate
      drawEdge(step.from, step.scanning, 'rgba(249,115,22,0.15)', 1, 1);
      // Bright ray to current best
      drawEdge(step.from, step.best, color, 0.6, 1.5);
      // Highlight pivot
      drawPoint(step.from, color, 6);
      // Highlight best candidate
      drawPoint(step.best, '#fff', 4);
      // Dim candidate being evaluated
      drawPoint(step.scanning, 'rgba(249,115,22,0.4)', 4);
    }

    if (step.type === 'edge') {
      drawPoint(step.a, color, 6);
      drawPoint(step.b, '#fff', 5);
    }

    if (doneHull) drawPolygon(doneHull, color, 0.08, 1);

    // Redraw points on top so they're visible
    drawPoints(state.points, PALETTE.point, 3);
  }

  // Graham: show stack as it builds, highlight push vs pop, and show polar sort order
  if (state.hullAlgo === 'graham') {
    drawPoints(state.points, PALETTE.dimPoint);

    if (step.type === 'sort') {
      // Draw polar sort spokes from pivot
      const pivot = step.pivot;
      for (let i = 1; i < step.sorted.length; i++) {
        const t = i / step.sorted.length;
        drawEdge(pivot, step.sorted[i], color, t * 0.3, 1);
      }
      drawPoint(pivot, color, 8);
      // Number each point by its sort order
      ctx.fillStyle = color;
      ctx.font = '10px JetBrains Mono';
      for (let i = 1; i < Math.min(step.sorted.length, 40); i++) {
        ctx.fillText(i, step.sorted[i].x + 6, step.sorted[i].y - 4);
      }
    }

    // Draw stack edges in order
    if (stackPts && stackPts.length >= 2) {
      for (let i = 0; i < stackPts.length - 1; i++) {
        const t = (i + 1) / stackPts.length;
        drawEdge(stackPts[i], stackPts[i + 1], color, 0.4 + t * 0.6, 2);
      }
    }

    // Highlight current push/pop
    if (step.type === 'push') {
      drawPoint(step.point, '#fff', 6);
      if (step.edge) drawEdge(step.edge.a, step.edge.b, color, 1, 2.5);
    }
    if (step.type === 'pop') {
      drawPoint(step.removed, 'rgba(255,80,80,0.9)', 6);
    }

    // Stack points highlighted
    if (stackPts) drawPoints(stackPts, color, 4.5);

    if (doneHull) drawPolygon(doneHull, color, 0.08, 1);
    drawPoints(state.points, PALETTE.point, 3);

    // Draw pivot
    if (sortedPts) drawPoint(sortedPts[0], color, 7);
  }

  // QuickHull: show split lines, candidate triangles, and final hull as it builds. 
  if (state.hullAlgo === 'quick') {
    drawPoints(state.points, PALETTE.dimPoint);

    // Construction lines are kept faint — only the final hull is bright
    for (let i = 0; i <= idx; i++) {
      const s = state.steps[i];
      if (s.type === 'split') {
        drawEdge(s.a, s.b, 'rgba(167,139,250,0.12)', 1, 1);
      }
      if (s.type === 'apex') {
        // Dim dashed-style construction lines, get slightly more faded with depth
        const alpha = Math.max(0.08, 0.2 - s.depth * 0.04);
        drawEdge(s.a, s.c, color, alpha, 1);
        drawEdge(s.c, s.b, color, alpha, 1);
      }
      if (s.type === 'edge') {
        // These are confirmed hull edges — but we only draw them bright in the done step
        drawEdge(s.a, s.b, color, 0.2, 1);
      }
    }

    // Highlight current active step
    if (step.type === 'apex') {
      drawEdge(step.a, step.b, 'rgba(167,139,250,0.15)', 1, 1);
      for (const p of step.region) {
        const d = distToLine(step.a, step.b, p);
        const maxD = Math.max(...step.region.map(q => distToLine(step.a, step.b, q)));
        ctx.fillStyle = `rgba(167,139,250,${0.15 + 0.25 * (d / (maxD || 1))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      drawPoint(step.c, '#fff', 7);
      // Active candidate edges — bright but still thinner than hull
      drawEdge(step.a, step.c, color, 0.55, 1.5);
      drawEdge(step.c, step.b, color, 0.55, 1.5);
    }

    if (doneHull) drawPolygon(doneHull, color, 0.08, 1);
    drawPoints(state.points, PALETTE.point, 3);
  }

  drawAlgoBadge();
}

// Triangulation step renderer: show candidate edges, bad triangles, and final triangulation as it builds.

function drawTriStep(idx) {
  const step  = state.steps[idx];
  const color = algoColor();

  drawPoints(state.points, PALETTE.dimPoint);

  // Greedy: flash candidate, show accepted/rejected
  if (state.triAlgo === 'greedy') {
    // Draw all accepted so far
    for (let i = 0; i <= idx; i++) {
      const s = state.steps[i];
      if (s.type === 'candidate' && s.ok) {
        drawEdge(s.edge.a, s.edge.b, color, 0.85, 1.5);
      }
    }

    // Highlight current candidate
    if (step.type === 'candidate') {
      const alpha = step.ok ? 1 : 0.25;
      const col   = step.ok ? color : '#ff5555';
      drawEdge(step.edge.a, step.edge.b, col, alpha, step.ok ? 2.5 : 1.5);
      drawPoint(step.edge.a, col, 5);
      drawPoint(step.edge.b, col, 5);
    }
  }

  // Bowyer-Watson: show bad triangles highlighted + polygon boundary
  if (state.triAlgo === 'bw') {
    // Draw existing triangulation edges up to this step
    if (step.type === 'insert' || step.type === 'done') {
      const tris = step.type === 'done'
        ? null
        : step.tris;

      if (tris) {
        const edgeMap = new Map();
        for (const t of tris) {
          for (const e of [{ a: t.a, b: t.b }, { a: t.b, b: t.c }, { a: t.c, b: t.a }]) {
            const k = [
              Math.min(e.a.x, e.b.x), Math.min(e.a.y, e.b.y),
              Math.max(e.a.x, e.b.x), Math.max(e.a.y, e.b.y),
            ].join(',');
            if (!edgeMap.has(k)) edgeMap.set(k, e);
          }
        }
        for (const e of edgeMap.values()) drawEdge(e.a, e.b, color, 0.5, 1);
      }

      if (step.type === 'insert') {
        // Highlight bad triangles
        for (const t of step.bad) {
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.moveTo(t.a.x, t.a.y); ctx.lineTo(t.b.x, t.b.y); ctx.lineTo(t.c.x, t.c.y);
          ctx.closePath(); ctx.fill();
          ctx.restore();
          for (const e of [{ a: t.a, b: t.b }, { a: t.b, b: t.c }, { a: t.c, b: t.a }])
            drawEdge(e.a, e.b, '#fb7185', 0.4, 1);
        }
        // Polygon boundary (bold)
        for (const e of step.polygon) drawEdge(e.a, e.b, '#fbbf24', 1, 2);
        // New point
        drawPoint(step.point, '#fff', 6);
      }
    }

    if (step.type === 'done') {
      for (const e of step.edges) drawEdge(e.a, e.b, color, 0.9, 1.5);
    }
  }

  drawPoints(state.points, PALETTE.point, 3.5);
  drawAlgoBadge();
}

// Badge and UI updates

const ALGO_LABELS = {
  jarvis: 'JARVIS MARCH',
  graham: 'GRAHAM SCAN',
  quick:  'QUICKHULL',
  greedy: 'GREEDY TRIANGULATION',
  bw:     'BOWYER–WATSON',
};

function drawAlgoBadge() {
  const algo  = state.mode === 'hull' ? state.hullAlgo : state.triAlgo;
  const label = ALGO_LABELS[algo] ?? algo;
  const color = algoColor();
  document.getElementById('step-badge').textContent = label;
  document.getElementById('step-badge').style.color = color;
}

// Recompute steps and redraw when points or algorithm changes

function recompute() {
  state.steps = [];
  stopPlay();

  if (!state.points.length) { draw(); return; }

  if (state.mode === 'hull') {
    if (state.hullAlgo === 'jarvis') jarvis_march();
    else if (state.hullAlgo === 'graham') grahams_scan();
    else quick_hull();
  }
  else if (state.mode === 'tri') {
    if (state.triAlgo === 'greedy') greedy_triangulation();
    else bowyer_watson();
  }

  const slider = document.getElementById('stepSlider');
  slider.max   = Math.max(0, state.steps.length - 1);
  currentStep  = state.steps.length - 1;
  slider.value = currentStep;
  updateStepCount();
  updateUI();
  draw();
}

// UI updates based on mode and steps, plus mobile drawer setup

function updateUI() {
  const isHull   = state.mode === 'hull';
  const isTri    = state.mode === 'tri';
  const hasSteps = state.steps.length > 0;

  document.getElementById('hull-section').classList.toggle('visible', isHull);
  document.getElementById('tri-section').classList.toggle('visible', isTri);
  document.getElementById('slider-section').classList.toggle('visible', hasSteps);

  const logoSpan = document.querySelector('#logo span');
  if (logoSpan) logoSpan.style.color = algoColor();
}

// Sync desktop and mobile mode toggles
function setMode(val) {
  state.mode = val;
  document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === val; });
  document.querySelectorAll('input[name="mode-m"]').forEach(r => { r.checked = r.value === val; });
  recompute();
}

document.getElementById('evenBtn').onclick   = even_dist;
document.getElementById('gaussBtn').onclick  = gauss_dist;
document.getElementById('evenBtnM').onclick  = even_dist;
document.getElementById('gaussBtnM').onclick = gauss_dist;

// Keep mobile and desktop point count inputs in sync
const numM = document.getElementById('numPointsM');
const numD = document.getElementById('numPoints');
numM.addEventListener('input', () => { numD.value = numM.value; });
numD.addEventListener('input', () => { numM.value = numD.value; });

document.getElementById('playBtn').onclick = () => {
  if (playTimer) stopPlay(); else startPlay();
};

document.getElementById('resetBtn').onclick = () => {
  stopPlay();
  playbackAt(0);
};

document.getElementById('stepSlider').oninput = function () {
  stopPlay();
  playbackAt(+this.value);
};

// Desktop mode toggle
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = () => setMode(radio.value);
});

// Mobile mode toggle (synced)
document.querySelectorAll('input[name="mode-m"]').forEach(radio => {
  radio.onchange = () => setMode(radio.value);
});

// Algorithm pickers
document.querySelectorAll('#hullPicker .algo-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('#hullPicker .algo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.hullAlgo = btn.dataset.algo;
    if (state.mode === 'hull') recompute();
  };
});

document.querySelectorAll('#triPicker .algo-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('#triPicker .algo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.triAlgo = btn.dataset.algo;
    if (state.mode === 'tri') recompute();
  };
});


(function setupDrawer() {
  const controls = document.getElementById('controls');
  const toolbar  = document.getElementById('mobile-toolbar');
  if (!controls || !toolbar) return;

  let startY = 0, startTranslate = 0, dragging = false;

  function isMobile() { return window.innerWidth <= 700; }

  function getTranslate() {
    const s = getComputedStyle(controls).transform;
    if (!s || s === 'none') return 0;
    const m = new DOMMatrix(s);
    return m.m42; // translateY
  }

  function openDrawer()  { controls.classList.add('open');    controls.style.transform = ''; }
  function closeDrawer() { controls.classList.remove('open'); controls.style.transform = ''; }

  // Toggle on toolbar tap
  toolbar.addEventListener('click', e => {
    if (!isMobile()) return;
    // Don't toggle if tapping a button/radio inside toolbar
    if (e.target.closest('button') || e.target.closest('label')) return;
    controls.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  // Also toggle on drag handle area (::before isn't clickable, so top 24px of aside)
  controls.addEventListener('click', e => {
    if (!isMobile()) return;
    if (e.offsetY < 28 && !controls.classList.contains('open')) openDrawer();
  });

  // Tap canvas to close
  canvas.addEventListener('click', () => {
    if (isMobile()) closeDrawer();
  });

  // Touch drag on the drawer
  controls.addEventListener('touchstart', e => {
    if (!isMobile()) return;
    startY = e.touches[0].clientY;
    startTranslate = getTranslate();
    dragging = true;
  }, { passive: true });

  controls.addEventListener('touchmove', e => {
    if (!isMobile() || !dragging) return;
    const dy = e.touches[0].clientY - startY;
    const collapsed = controls.offsetHeight - 56; // distance when closed
    let newY = Math.max(0, Math.min(collapsed, dy));
    controls.style.transition = 'none';
    controls.style.transform  = `translateY(${newY}px)`;
  }, { passive: true });

  controls.addEventListener('touchend', e => {
    if (!isMobile() || !dragging) return;
    dragging = false;
    controls.style.transition = '';
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 60)       closeDrawer();
    else if (dy < -30) openDrawer();
    else controls.classList.contains('open') ? openDrawer() : closeDrawer();
  });
})();

// Initial setup: generate points and draw first frame

window.addEventListener('load', () => {
  resizeCanvas();
  even_dist();
});
