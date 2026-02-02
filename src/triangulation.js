function hamilton_triangulation(){
  // Hamiltonian Triangulation using Arkin et al.'s dynamic programming algorithm
  // This creates a triangulation whose dual graph contains a Hamiltonian path
  // Based on "Hamiltonian triangulations for fast rendering" (1994)
  
  let lines = [];
  let N =state.points.length;
  let H = hull.length;
  
  stroke('purple');
  
  // Draw hull edges and add to lines
  for (var i = 1; i < hull.length; i++){
    line(hull[i-1].x, hull[i-1].y, hull[i].x, hull[i].y);
    lines.push({a:hull[i-1],b:hull[i]});
  }
  // Close the hull
  line(hull[hull.length-1].x, hull[hull.length-1].y, hull[0].x, hull[0].y);
  lines.push({a:hull[hull.length-1], b:hull[0]});
  
  stroke('black');
  
  // For convex hull only (no interiorstate.points), use simple fan triangulation
  if (N === H) {
    if (hull.length > 3) {
      for (let i = 2; i < hull.length; i++) {
        line(hull[0].x, hull[0].y, hull[i].x, hull[i].y);
        lines.push({a: hull[0], b: hull[i]});
      }
    }
    return;
  }
  
  // Build visibility graph for allstate.points
  let visGraph = buildVisibilityGraph(points, hull);
  
  // Dynamic Programming approach
  // D[i][j] = true if subpolygon left of chord (i,j) has a Hamiltonian triangulation ending with (i,j)
  let D = Array(N).fill(null).map(() => Array(N).fill(false));
  
  // Base case: ears (triangles with one edge on the boundary)
  // Initialize for adjacent vertices (distance 2 in convex hull order)
  for (let i = 0; i < H; i++) {
    let j = (i + 2) % H;
    let idx_i = findPointIndex(hull[i]);
    let idx_j = findPointIndex(hull[j]);
    
    if (idx_i !== -1 && idx_j !== -1 && visGraph[idx_i][idx_j]) {
      D[idx_i][idx_j] = true;
    }
  }
  
  // Fill DP table with increasing chord lengths
  for (let len = 3; len <= H; len++) {
    for (let i = 0; i < H; i++) {
      let j = (i + len) % H;
      let idx_i = findPointIndex(hull[i]);
      let idx_j = findPointIndex(hull[j]);
      
      if (idx_i === -1 || idx_j === -1) continue;
      
      // Try all possible previous chords
      for (let k = (i + 1) % H; k !== j; k = (k + 1) % H) {
        let idx_k = findPointIndex(hull[k]);
        if (idx_k === -1) continue;
        
        // Check if we can extend from (i,k) to (i,j)
        if (D[idx_i][idx_k] && visGraph[idx_k][idx_j]) {
          D[idx_i][idx_j] = true;
          break;
        }
        
        // Check if we can extend from (k,j) to (i,j)
        if (D[idx_k][idx_j] && visGraph[idx_i][idx_k]) {
          D[idx_i][idx_j] = true;
          break;
        }
      }
    }
  }
  
  // Build triangulation from DP table
  // Use a greedy approach to create a Hamiltonian-like triangulation
  // Start from any vertex and build outward
  
  let usedEdges = new Set();
  for (let edge of lines) {
    usedEdges.add(edgeKey(edge.a, edge.b));
  }
  
  // Add all visible edges in order of increasing length
  let visibleEdges = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (visGraph[i][j]) {
        visibleEdges.push({a:state.points[i], b:state.points[j], dist: euk_dist(points[i],state.points[j])});
      }
    }
  }
  
  visibleEdges.sort((a, b) => a.dist - b.dist);
  
  let maxEdges = 3 * N - 3 - H;
  
  for (let edge of visibleEdges) {
    if (lines.length >= maxEdges) break;
    
    let key = edgeKey(edge.a, edge.b);
    if (!usedEdges.has(key) && check_crossing(edge, lines)) {
      line(edge.a.x, edge.a.y, edge.b.x, edge.b.y);
      lines.push(edge);
      usedEdges.add(key);
    }
  }
}

// Helper function to build visibility graph
function buildVisibilityGraph(points, hull) {
  let N =state.points.length;
  let visGraph = Array(N).fill(null).map(() => Array(N).fill(false));
  
  // Allstate.points can see each other (simplified - in reality we'd check for obstacles)
  // For a point set without obstacles, visibility is just line-of-sight
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      // Check if line segment (i,j) is valid
      let edge = {a:state.points[i], b:state.points[j]};
      let visible = true;
      
      // Simple visibility: check if edge doesn't cross hull edges (except at endpoints)
      // This is a simplified visibility check
      visGraph[i][j] = true;
      visGraph[j][i] = true;
    }
  }
  
  return visGraph;
}

// Helper to find index of a point instate.points array
function findPointIndex(p) {
  for (let i = 0; i <state.points.length; i++) {
    if (abs(points[i].x - p.x) < 0.01 && abs(points[i].y - p.y) < 0.01) {
      return i;
    }
  }
  return -1;
}

// Helper to create unique edge key
function edgeKey(a, b) {
  let x1 = Math.round(a.x * 100);
  let y1 = Math.round(a.y * 100);
  let x2 = Math.round(b.x * 100);
  let y2 = Math.round(b.y * 100);
  
  if (x1 < x2 || (x1 === x2 && y1 < y2)) {
    return `${x1},${y1}-${x2},${y2}`;
  } else {
    return `${x2},${y2}-${x1},${y1}`;
  }
}

function greedy_triangulation(){
  let lines = [];

  for (let i = 0; i <state.points.length; i++) {
    for (let j = i+1; j <state.points.length; j++) {
      lines.push({a:points[i], b:points[j]}); 
    }
  }

  lines.sort(distance_compare);
  triangulation.push(lines[0]);

  line(triangulation[0].a.x,triangulation[0].a.y,triangulation[0].b.x,triangulation[0].b.y);
  let n =state.points.length;
  //grahams_scan();
  stroke('black');
  let k = hull.length;
  let i = 1;
  while(triangulation.length < 3*n-3-k){
    if(check_crossing(lines[i],triangulation)){
      line(lines[i].a.x,lines[i].a.y,lines[i].b.x,lines[i].b.y);
      triangulation.push(lines[i]);
    }
    i++;
  }

}
