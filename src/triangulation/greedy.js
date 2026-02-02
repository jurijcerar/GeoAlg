function greedy_triangulation() {
  state.edges = [];

  let lines = [];
  for (let i = 0; i < state.points.length; i++) {
    for (let j = i + 1; j < state.points.length; j++) {
      lines.push({ a: state.points[i], b: state.points[j] });
    }
  }

  lines.sort(distance_compare);

  let triangulation = [];

  for (let i = 0; i < lines.length; i++) {
    if (check_crossing(lines[i], triangulation)) {
      triangulation.push(lines[i]);
    }
  }

  state.edges = triangulation;
}
