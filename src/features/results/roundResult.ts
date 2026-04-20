export interface Placement {
  readonly horseId: string;
  readonly finishTimeMs: number;
}

export interface RoundResult {
  readonly roundIndex: number;
  readonly distanceMeters: number;
  readonly placements: readonly Placement[];
}
