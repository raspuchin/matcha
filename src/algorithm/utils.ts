import type { Player } from "../types";

export function pairKey(p1: Player, p2: Player): string {
  return [p1.id, p2.id].sort().join("::");
}

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
