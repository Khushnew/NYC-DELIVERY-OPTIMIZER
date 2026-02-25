/**
 * Route Optimization Algorithms
 * Implements multiple TSP solving strategies for delivery route optimization
 */

export interface Stop {
  id: string;
  lat: number;
  lng: number;
}

export interface OptimizationResult {
  stops: Stop[];
  distance: number;
  improvement: number;
}

/**
 * Calculate great-circle distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance of a route
 */
export function calculateRouteDistance(stops: Stop[]): number {
  if (stops.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateDistance(
      stops[i].lat,
      stops[i].lng,
      stops[i + 1].lat,
      stops[i + 1].lng
    );
  }
  // Add distance back to start
  total += calculateDistance(
    stops[stops.length - 1].lat,
    stops[stops.length - 1].lng,
    stops[0].lat,
    stops[0].lng
  );

  return total;
}

/**
 * Nearest Neighbor Algorithm
 * Greedy approach: always visit the nearest unvisited stop
 * Time Complexity: O(n²)
 * Quality: Good for quick solutions, 25-30% worse than optimal
 */
export function nearestNeighbor(stops: Stop[]): OptimizationResult {
  if (stops.length < 2) {
    return { stops, distance: 0, improvement: 0 };
  }

  const unvisited = new Set(stops.map((_, i) => i));
  const route: number[] = [0];
  unvisited.delete(0);

  while (unvisited.size > 0) {
    const current = route[route.length - 1];
    let nearest = -1;
    let minDist = Infinity;

    unvisited.forEach((idx) => {
      const dist = calculateDistance(
        stops[current].lat,
        stops[current].lng,
        stops[idx].lat,
        stops[idx].lng
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });

    route.push(nearest);
    unvisited.delete(nearest);
  }

  const optimizedStops = route.map(i => stops[i]);
  const distance = calculateRouteDistance(optimizedStops);

  return {
    stops: optimizedStops,
    distance,
    improvement: 0,
  };
}

/**
 * 2-Opt Algorithm
 * Local search: iteratively improve route by reversing segments
 * Time Complexity: O(n²) per iteration
 * Quality: 5-10% worse than optimal, much better than Nearest Neighbor
 */
export function twoOpt(stops: Stop[], maxIterations: number = 100): OptimizationResult {
  if (stops.length < 4) {
    return nearestNeighbor(stops);
  }

  // Start with nearest neighbor solution
  const nnResult = nearestNeighbor(stops);
  let route = nnResult.stops.map((s, i) => i);
  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        const a = route[i];
        const b = route[i + 1];
        const c = route[j];
        const d = route[(j + 1) % route.length];

        const currentDist =
          calculateDistance(stops[a].lat, stops[a].lng, stops[b].lat, stops[b].lng) +
          calculateDistance(stops[c].lat, stops[c].lng, stops[d].lat, stops[d].lng);

        const newDist =
          calculateDistance(stops[a].lat, stops[a].lng, stops[c].lat, stops[c].lng) +
          calculateDistance(stops[b].lat, stops[b].lng, stops[d].lat, stops[d].lng);

        if (newDist < currentDist) {
          // Reverse segment between i+1 and j
          const newRoute = [...route];
          let left = i + 1;
          let right = j;
          while (left < right) {
            [newRoute[left], newRoute[right]] = [newRoute[right], newRoute[left]];
            left++;
            right--;
          }
          route = newRoute;
          improved = true;
        }
      }
    }
  }

  const optimizedStops = route.map(i => stops[i]);
  const distance = calculateRouteDistance(optimizedStops);
  const nnDistance = calculateRouteDistance(nnResult.stops);

  return {
    stops: optimizedStops,
    distance,
    improvement: ((nnDistance - distance) / nnDistance) * 100,
  };
}

/**
 * Genetic Algorithm
 * Evolutionary approach: breed and mutate solutions to find better routes
 * Time Complexity: O(n² * population * generations)
 * Quality: 5-15% worse than optimal, competitive with 2-Opt
 */
export function geneticAlgorithm(
  stops: Stop[],
  populationSize: number = 50,
  generations: number = 100
): OptimizationResult {
  if (stops.length < 4) {
    return nearestNeighbor(stops);
  }

  // Create initial population
  const population: number[][] = [];
  for (let i = 0; i < populationSize; i++) {
    const route = Array.from({ length: stops.length }, (_, i) => i);
    // Shuffle
    for (let j = route.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [route[j], route[k]] = [route[k], route[j]];
    }
    population.push(route);
  }

  for (let gen = 0; gen < generations; gen++) {
    // Evaluate fitness
    const fitness = population.map(route => {
      const routeStops = route.map(i => stops[i]);
      const distance = calculateRouteDistance(routeStops);
      return 1 / (distance + 0.1); // Inverse distance as fitness
    });

    // Selection and breeding
    const newPopulation: number[][] = [];
    for (let i = 0; i < populationSize; i++) {
      // Tournament selection
      const idx1 = Math.floor(Math.random() * populationSize);
      const idx2 = Math.floor(Math.random() * populationSize);
      const parent1 = fitness[idx1] > fitness[idx2] ? population[idx1] : population[idx2];

      const idx3 = Math.floor(Math.random() * populationSize);
      const idx4 = Math.floor(Math.random() * populationSize);
      const parent2 = fitness[idx3] > fitness[idx4] ? population[idx3] : population[idx4];

      // Order crossover
      const child = orderCrossover(parent1, parent2);

      // Mutation
      if (Math.random() < 0.1) {
        mutate(child);
      }

      newPopulation.push(child);
    }

    population.splice(0, population.length, ...newPopulation);
  }

  // Return best solution
  const fitness = population.map(route => {
    const routeStops = route.map(i => stops[i]);
    return calculateRouteDistance(routeStops);
  });

  const bestIdx = fitness.indexOf(Math.min(...fitness));
  const bestRoute = population[bestIdx];
  const optimizedStops = bestRoute.map(i => stops[i]);
  const distance = calculateRouteDistance(optimizedStops);
  const nnDistance = calculateRouteDistance(nearestNeighbor(stops).stops);

  return {
    stops: optimizedStops,
    distance,
    improvement: ((nnDistance - distance) / nnDistance) * 100,
  };
}

/**
 * Order Crossover for Genetic Algorithm
 */
function orderCrossover(parent1: number[], parent2: number[]): number[] {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = Math.floor(Math.random() * size);
  const [a, b] = start < end ? [start, end] : [end, start];

  const child = Array(size).fill(-1);

  // Copy segment from parent1
  for (let i = a; i <= b; i++) {
    child[i] = parent1[i];
  }

  // Fill remaining from parent2
  let childIdx = (b + 1) % size;
  let parent2Idx = (b + 1) % size;

  while (childIdx !== a) {
    if (!child.includes(parent2[parent2Idx])) {
      child[childIdx] = parent2[parent2Idx];
      childIdx = (childIdx + 1) % size;
    }
    parent2Idx = (parent2Idx + 1) % size;
  }

  return child;
}

/**
 * Mutation for Genetic Algorithm
 */
function mutate(route: number[]): void {
  const i = Math.floor(Math.random() * route.length);
  const j = Math.floor(Math.random() * route.length);
  [route[i], route[j]] = [route[j], route[i]];
}

/**
 * Run all algorithms and return comparison
 */
export function compareAlgorithms(stops: Stop[]): OptimizationResult[] {
  const nn = nearestNeighbor(stops);
  const opt2 = twoOpt(stops);
  const ga = geneticAlgorithm(stops);

  return [opt2, ga, nn].sort((a, b) => a.distance - b.distance);
}
