'use strict';

const state = {
  points: [],   // [{x, y}, ...]
  steps:  [],   // [{type, ...}, ...] — algorithm animation steps
  mode:   'none',  // 'none' | 'hull' | 'tri'
  hullAlgo: 'jarvis',
  triAlgo:  'greedy',
};
