export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  sample: <T>(arr: readonly T[], k: number) => T[];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(next: () => number): Rng {
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    sample: (arr, k) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      }
      return copy.slice(0, k);
    },
  };
}

export const defaultRng: Rng = makeRng(Math.random);

export function createSeededRng(seed: number): Rng {
  return makeRng(mulberry32(seed));
}
