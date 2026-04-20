import type { RaceProgram } from './program';
import type { Horse } from '@/features/horses';
import type { Rng } from '@/shared/random';
import { defaultRng } from '@/shared/random';
import { HORSES_PER_ROUND, ROUND_DISTANCES } from './rounds';

export function generateProgram(
  roster: readonly Horse[],
  rng: Rng = defaultRng,
): RaceProgram {
  if (roster.length < HORSES_PER_ROUND)
    throw new RangeError(`roster has ${roster.length} horses; need ${HORSES_PER_ROUND}`);

  const rounds = ROUND_DISTANCES.map((distanceMeters, index) => ({
    index,
    distanceMeters,
    lineup: rng.sample(roster, HORSES_PER_ROUND).map(h => h.id),
  }));

  return { rounds };
}
