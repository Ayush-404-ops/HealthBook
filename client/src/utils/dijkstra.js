/**
 * Dijkstra's shortest path algorithm.
 *
 * @param {Object} graph - Adjacency list: { nodeId: [{ to: nodeId, weight: number }] }
 * @param {string} startId - The starting node ID
 * @returns {{ distances: Object, previous: Object }}
 */
export function dijkstra(graph, startId) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  Object.keys(graph).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
  });
  distances[startId] = 0;

  while (true) {
    // Find the unvisited node with the smallest known distance
    const unvisited = Object.keys(distances).filter((id) => !visited.has(id));
    if (unvisited.length === 0) break;

    const current = unvisited.reduce((minNode, id) =>
      distances[id] < distances[minNode] ? id : minNode
    );

    if (distances[current] === Infinity) break;
    visited.add(current);

    for (const neighbor of graph[current] || []) {
      const newDist = distances[current] + neighbor.weight;
      if (newDist < distances[neighbor.to]) {
        distances[neighbor.to] = newDist;
        previous[neighbor.to] = current;
      }
    }
  }

  return { distances, previous };
}

/**
 * Reconstruct the path from start to target using the `previous` map.
 *
 * @param {Object} previous - Output from dijkstra()
 * @param {string} targetId - The destination node ID
 * @returns {string[]} - Ordered array of node IDs from start to target
 */
export function getPath(previous, targetId) {
  const path = [];
  let current = targetId;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = previous[current];
  }
  return path;
}
