function setup() {
  let c = createCanvas(1200, 800);
  c.parent("canvas-container");

  state.slider = createSlider(0, 0, 0, 1); // min, max, initial, step
  state.slider.parent(document.getElementById("controls"));

  document.getElementById("evenBtn").onclick = even_dist;
  document.getElementById("gaussBtn").onclick = gauss_dist;
  document.getElementById("runHull").onclick = run_hull;
  //document.getElementById("runTri").onclick = run_triangulation;
}


function run_hull() {

  state.edges = [];

  let algo = document.getElementById("hullAlgo").value;
  if (algo === "graham") grahams_scan();
  else if (algo === "quick") quick_hull();
  else jarvis_march();

  state.slider.attribute("max", state.edges.length);
  state.slider.value(state.edges.length);
}

function run_triangulation() {
  triangulation = [];
  let algo = document.getElementById("triAlgo").value;

  if (algo === "greedy") greedy_triangulation();
  else hamilton_triangulation();
}

function draw() {
  clear();
  draw_points();
  let n = state.slider.value();
  stroke("purple");
  strokeWeight(2);
  for (let i = 0; i < n; i++) {
    line(state.edges[i].a.x, state.edges[i].a.y, state.edges[i].b.x, state.edges[i].b.y);
  }
}

