export interface Round {
  readonly index: number;
  readonly distanceMeters: number;
  readonly lineup: readonly string[];
}

export interface RaceProgram {
  readonly rounds: readonly Round[];
}
