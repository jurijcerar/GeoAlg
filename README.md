# Computational Geometry Visualizer

An interactive visualizer for convex hull and triangulation algorithms, built with vanilla JS and the Canvas 2D API. No frameworks, no dependencies.

## Features

- **Step-by-step playback** — scrub through each algorithm's execution with a slider or let it animate automatically
- **Three convex hull algorithms**, each with a visually distinct animation style
- **Two triangulation algorithms**
- **Two point distributions** — uniform random and Gaussian cluster
- **Responsive** — works on desktop and mobile (bottom drawer UI on small screens)

## Algorithms

### Convex Hull

| Algorithm | Complexity | Visual style during playback |
|---|---|---|
| Jarvis March | O(nh) | Rotating scan ray sweeps all candidates from the current pivot |
| Graham Scan | O(n log n) | Polar sort spokes from pivot, then stack grows/shrinks with push/pop flashes |
| QuickHull | O(n log n) avg | Recursive region splits with faint construction lines, bright apex selection |

### Triangulation

| Algorithm | Style |
|---|---|
| Greedy | Sorts all edges by length, accepts shortest non-crossing edges — rejected edges flash red |
| Bowyer–Watson | Delaunay triangulation via circumcircle insertion — bad triangles highlight red, boundary polygon flashes yellow |


## Running

A demo can be found [here](https://jurijcerar.github.io/JS-Geometry/). You can also run it locally.

