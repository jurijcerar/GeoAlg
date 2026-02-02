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

