function setup() {
  let c = createCanvas(1200, 800);
  c.parent("canvas-container");
  strokeWeight(2);

  document.getElementById("evenBtn").onclick = even_dist;
  document.getElementById("gaussBtn").onclick = gauss_dist;
  document.getElementById("runHull").onclick = run_hull;
  document.getElementById("runTri").onclick = run_triangulation;
}

function run_hull() {
  clear();
  hull = [];

  let algo = document.getElementById("hullAlgo").value;
  if (algo === "graham") grahams_scan();
  else if (algo === "quick") quick_hull();
  else jarvis_march();

  stroke("purple");
  for (let i = 1; i < hull.length; i++) {
    line(hull[i-1].x, hull[i-1].y, hull[i].x, hull[i].y);
  }
}

function run_triangulation() {
  triangulation = [];
  let algo = document.getElementById("triAlgo").value;

  if (algo === "greedy") greedy_triangulation();
  else hamilton_triangulation();
}


function draw() {

}
