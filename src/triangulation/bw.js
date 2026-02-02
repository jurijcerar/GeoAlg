
function inCircumcircle(p, tri) {
  let ax = tri.a.x - p.x;
  let ay = tri.a.y - p.y;
  let bx = tri.b.x - p.x;
  let by = tri.b.y - p.y;
  let cx = tri.c.x - p.x;
  let cy = tri.c.y - p.y;

  let det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);

  return det * orient(tri.a, tri.b, tri.c) > 0;
}

function samePoint(p, q) {
  return p.x === q.x && p.y === q.y;
}

function sameEdge(e1, e2) {
  return (
    (samePoint(e1.a, e2.a) && samePoint(e1.b, e2.b)) ||
    (samePoint(e1.a, e2.b) && samePoint(e1.b, e2.a))
  );
}

function Triangle(a, b, c) {
  return { a, b, c };
}

function bowyer_watson() {

  state.edges = [];
  let triangulation = [];


  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let p of state.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  let dx = maxX - minX;
  let dy = maxY - minY;
  let delta = Math.max(dx, dy) * 100;

  let p1 = { x: minX - delta, y: minY - delta };
  let p2 = { x: minX - delta, y: maxY + delta * 2 };
  let p3 = { x: maxX + delta * 2, y: minY - delta };

  let superTri = Triangle(p1, p2, p3);
  triangulation.push(superTri);


  for (let idx = 0; idx < state.points.length; idx++) {
    let p = state.points[idx];

    let badTriangles = [];

    for (let tri of triangulation) {
      if (inCircumcircle(p, tri)) {
        badTriangles.push(tri);
      }
    }


    let polygon = [];

    for (let tri of badTriangles) {
      let edges = [
        { a: tri.a, b: tri.b },
        { a: tri.b, b: tri.c },
        { a: tri.c, b: tri.a }
      ];

      for (let e of edges) {
        let shared = false;

        for (let other of badTriangles) {
          if (other === tri) continue;

          let otherEdges = [
            { a: other.a, b: other.b },
            { a: other.b, b: other.c },
            { a: other.c, b: other.a }
          ];

          for (let oe of otherEdges) {
            if (sameEdge(e, oe)) {
              shared = true;
              break;
            }
          }
          if (shared) break;
        }

        if (!shared) {
          polygon.push(e);
        }
      }
    }


    triangulation = triangulation.filter(t => !badTriangles.includes(t));

    for (let e of polygon) {
      let newTri = Triangle(e.a, e.b, p);
      triangulation.push(newTri);

    }
  }


  triangulation = triangulation.filter(tri =>
    !samePoint(tri.a, p1) && !samePoint(tri.a, p2) && !samePoint(tri.a, p3) &&
    !samePoint(tri.b, p1) && !samePoint(tri.b, p2) && !samePoint(tri.b, p3) &&
    !samePoint(tri.c, p1) && !samePoint(tri.c, p2) && !samePoint(tri.c, p3)
  );

state.edges = [];
let edgeSet = new Map();

for (let tri of triangulation) {
  let edges = [
    { a: tri.a, b: tri.b },
    { a: tri.b, b: tri.c },
    { a: tri.c, b: tri.a }
  ];
  
  for (let e of edges) {
    let key = [
      Math.min(e.a.x, e.b.x), 
      Math.min(e.a.y, e.b.y),
      Math.max(e.a.x, e.b.x),
      Math.max(e.a.y, e.b.y)
    ].join(',');
    
    if (!edgeSet.has(key)) {
      edgeSet.set(key, e);
      state.edges.push(e);
    }
  }
}

  return triangulation;
}
