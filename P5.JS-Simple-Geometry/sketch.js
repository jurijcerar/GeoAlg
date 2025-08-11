var points = [0,0,0,0,0]; //T1,T2,T3,T4,Tp
var counter = 0; // število točk, max 4

var output;

function setup() {
  createCanvas(800, 800); //canvas na katerega rišemo
  inputX = createInput(); //vnos x
  inputX.position(900,15); //kje se nahaja
  inputY = createInput(); //vnos y
  inputY.position(900,35); //kje se nahaja
  button = createButton('submit'); //gumb 
  button.position(900,55);
  button.mousePressed(manual_point); //ob pritisku gumba vnesemo točko
  output = createElement('ul', 'Razdalja: ');
  output.position(900, 100);
}

function distance(){ //izračun Evklidove razdalje
  var e_distance = sqrt(pow(points[0].X - points[1].X, 2) + pow(points[0].Y - points[1].Y, 2));
  var m_distance = abs(points[0].X - points[1].X) + abs(points[0].Y - points[1].Y);
  var c_distance = max(abs(points[0].X - points[1].X) , abs(points[0].Y - points[1].Y));
  output.html("<li> Evklidska: " + e_distance + "<li> Manhattanova: " + m_distance + "<li> Chebyshejeva: " + c_distance);
}

function projection(){ //projekcija T3 na daljico (T1,T2)
  var v1 = createVector((points[1].X-points[0].X), (points[1].Y-points[0].Y))
  let magnitude = v1.mag();
  var v2 = createVector((points[2].X-points[0].X), (points[2].Y-points[0].Y))
  var vn = v1;
  vn.normalize();
  var exist = "";
  var direction;
  var distance;
  let sp = vn.dot(v2);
  if(sp >= 0 && sp <= magnitude){
    vn.mult(sp);
    points[4] = { X:points[0].X + vn.x, Y:points[0].Y + vn.y };
    stroke('purple');
    strokeWeight(2);
    line(points[4].X, points[4].Y, points[2].X, points[2].Y);
    distance = sqrt(pow(points[4].X - points[2].X, 2) + pow(points[4].Y - points[2].Y, 2));
    output.html("<li> Razdalja med točko in daljico je : " + distance);
  }
  else{
    exist = "<li> Projekcija ne obstaja </li>";
    let distance1 = sqrt(pow(points[0].X - points[2].X, 2) + pow(points[0].Y - points[2].Y, 2));
    let distance2 = sqrt(pow(points[1].X - points[2].X, 2) + pow(points[1].Y - points[2].Y, 2));
    distance = min(distance1,distance2);
  }

  var v1 = createVector((points[1].X-points[0].X), (points[1].Y-points[0].Y));
  var v2 = createVector((points[2].X-points[0].X), (points[2].Y-points[0].Y));

  let sign = v1.cross(v2).z;

  if(sign < 0){
    direction = "<li> Nahaja se na desni strani daljice </li>"
  }
  else if(sign > 0){
    direction = "<li> Nahaja se na levi strani daljice </li>"
  }
  else {
    direction = "<li> Nahaja se na daljici </li>"
  }
  output.html(exist + "<li> Razdalja med točko in daljico je : " + distance + direction);
}

function vertex_of_lines (){
  var status;

  var D = (points[1].X - points[0].X) * (points[3].Y - points[2].Y) - (points[3].X - points[2].X) * (points[1].Y - points[0].Y)
  var A = (points[3].X - points[2].X) * (points[0].Y - points[2].Y) - (points[0].X - points[2].X) * (points[3].Y - points[2].Y)
  var B = (points[1].X - points[0].X) * (points[0].Y - points[2].Y) - (points[0].X - points[2].X) * (points[1].Y - points[0].Y)

  if(D == A && A == B && B == 0){
    status = "<li> Daljici sovpadata </li>";
    var sort = points;

    for (var i=0; i < 3; i++){
      if(sort[i].X > sort[i+1].X){
        let temp = sort[i];
        sort[i] = sort[i+1];
        sort[i+1] = temp;
      }
      else if(sort[i].X == sort[i+1].X){
        if(sort[i].Y > sort[i+1].Y){
          let temp = sort[i];
          sort[i] = sort[i+1];
          sort[i+1] = temp;
        }
      }
    }
    console.log(sort);
    stroke('green');
    strokeWeight(2);
    line(sort[1].X, sort[1].Y, sort[2].X, sort[2].Y);
  }
  else if(D == 0){
    status = "<li> Daljici sta vzporedni </li>";
  }
  else if(A == 0 || B == 0){
    status = "<li> Daljici imata eno točko enako </li>";
    var Ua = A/D;
    var Ub = B/D;
    var x,y;
    x = points[0].X + Ua * (points[1].X - points[0].X);
    y = points[0].Y + Ua * (points[1].Y - points[0].Y);
    status = "<li> Daljici imata eno točko enako => X: " + x + " Y: " + y +"</li>";
  }
  else {
    var Ua = A/D;
    var Ub = B/D;
    if(Ua >= 0 && Ua <= 1 && Ub >= 0 && Ub <= 1){
      let x = points[0].X + Ua * (points[1].X - points[0].X);
      let y = points[0].Y + Ua * (points[1].Y - points[0].Y);
      status = "<li> Daljici se sekata v točki => X: " + x + " Y: " + y +"</li>";
      stroke('red');
      strokeWeight(5);
      point(x,y);
    }
    else{
      status = "<li> Daljici se ne sekata </li>";
    }
  }
  output.html(status);
}

function manual_point(){ //točka preko gumba
  var x = inputX.value();
  var y = inputY.value();
  x = parseInt(x);
  y = parseInt(y);
  create_point(x,y);
}

function create_point(x,y){ //ustvarimo točko
  if(x < 801 && y < 801){
    var p = {X:x, Y:y};
    points[counter] = p;
    stroke('red');
    strokeWeight(5);
    point(x,y);
    counter = counter + 1;
  }
}

function draw() {
  
  if(counter == 2){
    distance();
  }
  
  if(counter == 3){
    stroke('black');
    strokeWeight(2);
    line(points[0].X, points[0].Y, points[1].X, points[1].Y);
    projection();
  }
  
  else if(counter == 4){
    stroke('black');
    strokeWeight(2);
    line(points[2].X, points[2].Y, points[3].X, points[3].Y);
    vertex_of_lines();
  }
    
  else if(counter == 5){
    clear();
    counter = 0;
  }
}

function mouseClicked() {
  create_point(mouseX,mouseY);
}