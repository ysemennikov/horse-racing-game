import type { FinishTimes } from './raceLoop';
import type { Horse } from '@/features/horses';
import type { RoundResult } from '@/features/results';
import type { Round } from '@/features/schedule/program';

export function computeFinishOrder(
  round: Round,
  finishTimes: FinishTimes,
  byId: ReadonlyMap<string, Horse>,
): RoundResult {
  const placements = Object.entries(finishTimes)
    .map(([horseId, finishTimeMs]) => ({
      horseId,
      finishTimeMs,
      condition: byId.get(horseId)?.condition ?? 0,
    }))
    .sort((a, b) => {
      if (a.finishTimeMs !== b.finishTimeMs)
        return a.finishTimeMs - b.finishTimeMs;
      if (a.condition !== b.condition)
        return b.condition - a.condition;
      return a.horseId.localeCompare(b.horseId);
    })
    .map(({ horseId, finishTimeMs }) => ({ horseId, finishTimeMs }));

  return {
    roundIndex: round.index,
    distanceMeters: round.distanceMeters,
    placements,
  };
}
