import type { Horse } from './horse';
import type { Rng } from '@/shared/random';
import { defaultRng } from '@/shared/random';
import { PALETTE } from './palette';

export function createRoster(rng: Rng = defaultRng): readonly Horse[] {
  return PALETTE.map((color, i) => {
    const number = String(i + 1).padStart(2, '0');
    return {
      id: `horse-${number}`,
      name: `Horse #${number}`,
      color,
      condition: rng.int(1, 100),
    };
  });
}
