function setup() {
  let w = document.getElementById("canvas-container").offsetWidth;
  let h = window.innerHeight * 0.9;

  let c = createCanvas(w, h);
  c.parent("canvas-container");

  state.slider = createSlider(0, 0, 0, 1);
  state.slider.parent(document.getElementById("controls"));
  
  state.slider.input(() => redraw());
  
  noLoop();

  document.querySelector('input[name="mode"][value="none"]').checked = true;
  state.mode = "none";

  document.getElementById("evenBtn").onclick = even_dist;
  document.getElementById("gaussBtn").onclick = gauss_dist;
  
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.onchange = () => {
      state.mode = radio.value;
      recompute();
    };
  });

  document.getElementById("hullAlgo").onchange = () => {
    if (state.mode === "hull") recompute();
  };

  document.getElementById("triAlgo").onchange = () => {
    if (state.mode === "tri") recompute();
  };
}

function updateUI() {
  document.getElementById("hullAlgo").disabled = state.mode !== "hull";
  document.getElementById("triAlgo").disabled = state.mode !== "tri";
}


function recompute() {
  updateUI();
  state.edges = [];

  if (state.mode === "hull") {
    let algo = document.getElementById("hullAlgo").value;
    if (algo === "graham") grahams_scan();
    else if (algo === "quick") quick_hull();
    else jarvis_march();
  }

  else if (state.mode === "tri") {
    let algo = document.getElementById("triAlgo").value;
    if (algo === "greedy") greedy_triangulation();
    else bowyer_watson();
  }

  state.slider.attribute("max", state.edges.length);
  state.slider.value(state.edges.length);

  redraw();
}

function draw() {
  clear();
  draw_points();
  let n = state.slider.value();
  if (n > 0) {
    stroke("purple");
    strokeWeight(2);
    for (let i = 0; i < n; i++) {
      line(state.edges[i].a.x, state.edges[i].a.y, state.edges[i].b.x, state.edges[i].b.y);
    }
  }

}

