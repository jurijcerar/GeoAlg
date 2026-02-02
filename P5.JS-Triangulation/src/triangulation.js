
function hamilton_triangulation(){
  hull = [];
  let lines = [];
  let N = points.length;
  let sp = jarvis_march();
  stroke('purple');

  for (var i = 1; i < hull.length; i++){
    line(hull[i-1].x, hull[i-1].y, hull[i].x, hull[i].y);
    lines.push({a:hull[i-1],b:hull[i]});
  }
  stroke('black');
  let a = sp;
  let b = sp+1;
  let c = 0;

  triangle(hull[a].x,hull[a].y,hull[b].x,hull[b].y,hull[c].x,hull[c].y);
  lines.push({a:hull[b],b:hull[c]});
  let l = 0;
  while(l < 3*N-sp-3){
    let temp = b;
    a = b;
    b = c;
    c = min(temp + 1, N-1);
    if(check_crossing({a:hull[b],b:hull[c]},lines)){
      line(hull[b].x,hull[b].y,hull[c].x,hull[c].y);
      lines.push({a:hull[b],b:hull[c]});
    }
    else{
      c = a;
    }
    l++;
  }

  /*for(let i=0; i< 100; i++){
    let temp = {a:hull[b],b:hull[c]};
    if(check_crossing(temp,lines)){
      line(hull[b].x,hull[b].y,hull[c].x,hull[c].y);
      lines.push({a:hull[b],b:hull[c]});
    }
    else{
      c = a;
    }
    a = b;
    b = c;
    c = min(a + 1, N);
  }*/
}




function greedy_triangulation(){
  let lines = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i+1; j < points.length; j++) {
      lines.push({a:points[i], b:points[j]}); 
    }
  }

  lines.sort(distance_compare);
  triangulation.push(lines[0]);

  line(triangulation[0].a.x,triangulation[0].a.y,triangulation[0].b.x,triangulation[0].b.y);
  let n = points.length;
  grahams_scan();
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
