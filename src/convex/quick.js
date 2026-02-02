function find_hull(pointsSubset, a, b) {
    if (!pointsSubset.length) return;

    let maxDist = -1;
    let c = null;
    for (let p of pointsSubset) {
        let d = distToLine(a, b, p);
        if (d > maxDist) {
            maxDist = d;
            c = p;
        }
    }

    let idx = hull.indexOf(b);
    hull.splice(idx, 0, c);

    addEdge(a, c);
    addEdge(c, b);

    let leftSet = [];
    let rightSet = [];
    for (let p of pointsSubset) {
        if (p === c) continue;

        if (side(a, c, p) === 1) leftSet.push(p);
        else if (side(c, b, p) === 1) rightSet.push(p);
    }

    find_hull(leftSet, a, c);
    find_hull(rightSet, c, b);
}

function quick_hull() {
    hull = [];

    let minX = state.points[0];
    let maxX = state.points[0];
    for (let p of state.points) {
        if (p.x < minX.x) minX = p;
        if (p.x > maxX.x) maxX = p;
    }

    hull.push(minX);
    hull.push(maxX);

    addEdge(minX, maxX);

    let leftSet = [];
    let rightSet = [];
    for (let p of state.points) {
        if (p === minX || p === maxX) continue;

        if (side(minX, maxX, p) === 1) leftSet.push(p);
        else if (side(minX, maxX, p) === -1) rightSet.push(p);
    }

    find_hull(leftSet, minX, maxX);
    find_hull(rightSet, maxX, minX);


    state.edges = [];
    for (let i = 0; i < hull.length; i++) {
        let a = hull[i];
        let b = hull[(i + 1) % hull.length];
        addEdge(a, b);
    }
}