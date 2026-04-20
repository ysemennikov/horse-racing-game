import type { Horse } from '@/features/horses';
import type { Round } from '@/features/schedule/program';
import type { Rng } from '@/shared/random';
import { defaultRng } from '@/shared/random';

const BASE_METERS_PER_FRAME = 8;
const REFERENCE_FRAME_MS = 16.6;
const JITTER_BAND = 0.15;

function readSpeedFactor(): number {
  if (typeof window === 'undefined')
    return 1;
  return new URLSearchParams(window.location.search).get('fast') === '1' ? 10 : 1;
}

const SPEED_FACTOR = readSpeedFactor();

export type Positions = Readonly<Record<string, number>>;
export type FinishTimes = Readonly<Record<string, number>>;

export interface RoundResultTimes {
  positions: Positions;
  finishTimes: FinishTimes;
}

export function runRound(
  round: Round,
  byId: ReadonlyMap<string, Horse>,
  onFrame: (positions: Positions) => void,
  rng: Rng = defaultRng,
): Promise<RoundResultTimes> {
  return new Promise((resolve) => {
    const positions: Record<string, number> = Object.fromEntries(round.lineup.map(id => [id, 0]));
    const finishTimes: Record<string, number> = {};
    const startedAt = performance.now();
    let lastFrameAt = startedAt;

    const tick = (now: number) => {
      const scale = Math.max(0, (now - lastFrameAt) / REFERENCE_FRAME_MS);
      lastFrameAt = now;

      for (const id of round.lineup) {
        if (finishTimes[id] !== undefined)
          continue;
        const horse = byId.get(id);
        if (!horse)
          continue;
        const conditionFactor = 0.6 + (0.4 * horse.condition) / 100;
        const jitter = (rng.next() * 2 - 1) * JITTER_BAND;
        const step = BASE_METERS_PER_FRAME * SPEED_FACTOR * conditionFactor * (1 + jitter) * scale;
        const advanced = (positions[id] ?? 0) + step;
        if (advanced >= round.distanceMeters) {
          positions[id] = round.distanceMeters;
          finishTimes[id] = now - startedAt;
        }
        else {
          positions[id] = advanced;
        }
      }

      onFrame(positions);

      if (round.lineup.every(id => finishTimes[id] !== undefined))
        resolve({ positions, finishTimes });
      else
        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}
