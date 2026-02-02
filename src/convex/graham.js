function grahangle(a, b) {
    var a = atan2(a.y - b.y, a.x - b.x);
    if (a < 0) {
        a = a + 2 * PI;
    }
    return a;
}

function grahamsort(a, b) {
    let angA = grahangle(a, state.points[0]);
    let angB = grahangle(b, state.points[0]);

    if (!equals(angA, angB)) return angA - angB;
    return euk_dist(state.points[0], a) - euk_dist(state.points[0], b);
}


function grahams_scan() {
    hull = [];

    state.points.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
    let temp1 = state.points.slice(1);
    let temp2 = state.points.slice(0, 1);
    temp1.sort(grahamsort);
    state.points = temp2.concat(temp1);

    hull.push(state.points[0].copy());
    hull.push(state.points[1].copy());
    hull.push(state.points[2].copy());

    for (let i = 3; i < state.points.length; i++) {
        let p3 = state.points[i].copy();

        while (
            hull.length > 1 &&
            p5.Vector.cross(
                hull[hull.length - 1].copy().sub(hull[hull.length - 2]),
                p3.copy().sub(hull[hull.length - 2])
            ).z <= 0
        ) {
            hull.pop(); // just maintain convexity
        }

        hull.push(p3); // add new hull point
    }

    state.edges = [];
    for (let i = 0; i < hull.length; i++) {
        let a = hull[i];
        let b = hull[(i + 1) % hull.length]; 
        addEdge(a,b);
    }
}
