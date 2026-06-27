import type { PricePoint } from "./types";

/**
 * Renvoie le point de prix le plus proche d'une date cible dans une série
 * triée par date croissante. Utilisé car le dataset est mensuel alors que les
 * dates d'investissement peuvent être quotidiennes/hebdomadaires.
 */
export function findClosestPrice(
  series: PricePoint[],
  targetDate: string
): PricePoint {
  if (series.length === 0) {
    throw new Error("La série de prix est vide");
  }

  const targetTime = new Date(targetDate).getTime();
  let closest = series[0];
  let smallestDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

  for (const point of series) {
    const diff = Math.abs(new Date(point.date).getTime() - targetTime);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = point;
    }
  }

  return closest;
}
