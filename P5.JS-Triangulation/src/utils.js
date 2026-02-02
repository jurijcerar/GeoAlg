function equals(a, b) {
  return abs(a - b) < 1e-9;
}

function euk_dist(a,b){
  return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

function distance_compare(a,b){
  return euk_dist(a.a,a.b) - euk_dist(b.a,b.b);
}

function check_crossing(lines,triangulation){
  for(let j = 0; j < triangulation.length; j++){

    let D = (lines.b.x - lines.a.x) * (triangulation[j].b.y - triangulation[j].a.y) - (triangulation[j].b.x - triangulation[j].a.x) * (lines.b.y - lines.a.y);
    let A = (triangulation[j].b.x - triangulation[j].a.x) * (lines.a.y - triangulation[j].a.y) -  (lines.a.x - triangulation[j].a.x) * (triangulation[j].b.y - triangulation[j].a.y);
    let B = (lines.b.x - lines.a.x) * (lines.a.y - triangulation[j].a.y) - (lines.a.x - triangulation[j].a.x) * (lines.b.y - lines.a.y);

    if (equals(D, 0) && equals(A, 0) && equals(B, 0)) {
      return false; // soupadajo
    }

    if(equals(D,0)){
      continue;
    }

    var Ua = A/D;
    var Ub = B/D;

    if (equals(Ua, 1) || equals(Ua, 0) || equals(Ub, 1) || equals(Ub, 0)) {
      continue;
    }

    if(Ua > 0 && Ua < 1 && Ub > 0 && Ub < 1 ){
      return false;
    }
  
  }
  //line(lines.a.x,lines.a.y,lines.b.x,lines.b.y);
  return true;
}

function get_min_E(){
  var min = 1200;
  var E,j;
  for (var i = 0; i < points.length; i++ ){
    if(min > points[i].x){
      min = points[i].x;
      E = points[i];
      j = i;
    }
  }
  points.splice(j, 1);
  return E;
}

function get_max_E(){
  var max = 0;
  var E,j;
  for (var i = 0; i < points.length; i++ ){
    if(max < points[i].x){
      max = points[i].x;
      E = points[i];
      j = i;
    }
  }
  points.splice(j, 1);
  return E;
}

function get_S1(){
  var E = get_min_E();
  var j;
  var s1 = points[0];
  var vy = createVector(0,1);
  var minangle = angle(vy,s1);
  for (var i = 1; i < points.length; i++){
    var vs = points[i].copy().sub(E);
    var newangle= angle(vy,vs);
    if(newangle < minangle){
      s1 = points[i];
      j = i;
      minangle = newangle;
    }
    else if(equals(newangle, minangle)){
      if(euk_dist(E,s1) > euk_dist(E,points[i])){
        s1 = points[i];
        j = i;  
      }
    }
  }
  hull.push(E);
  hull.push(s1);
  points.splice(j,1);
  points.push(E);
  return E;
}

function orientation(p, q, r) {
  return p5.Vector
    .cross(q.copy().sub(p), r.copy().sub(p))
    .z;
}
function distToLine(a, b, p) {
  // distance from point p to line a-b
  return abs(p5.Vector.cross(b.copy().sub(a), p.copy().sub(a)).z);
}

function side(a, b, p) {
  // returns 1 if p is left of a-b, -1 if right, 0 if collinear
  let val = p5.Vector.cross(b.copy().sub(a), p.copy().sub(a)).z;
  if (val > 0) return 1;
  if (val < 0) return -1;
  return 0;
}
