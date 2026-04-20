import { describe, expect, it } from 'vitest';
import { createRoster } from '@/features/horses';
import { createSeededRng } from '@/shared/random';
import { generateProgram } from '../programGenerator';
import { ROUND_DISTANCES } from '../rounds';

describe('generateProgram', () => {
  it('produces exactly 6 rounds with canonical distances', () => {
    const roster = createRoster(createSeededRng(1));
    const program = generateProgram(roster, createSeededRng(2));
    expect(program.rounds).toHaveLength(6);
    expect(program.rounds.map(r => r.distanceMeters)).toEqual([...ROUND_DISTANCES]);
    program.rounds.forEach((r, i) => expect(r.index).toBe(i));
  });

  it('every lineup has 10 distinct horses from the roster', () => {
    const roster = createRoster(createSeededRng(1));
    const rosterIds = new Set(roster.map(h => h.id));
    const program = generateProgram(roster, createSeededRng(2));
    program.rounds.forEach((r) => {
      expect(r.lineup).toHaveLength(10);
      expect(new Set(r.lineup).size).toBe(10);
      r.lineup.forEach(id => expect(rosterIds.has(id)).toBe(true));
    });
  });

  it('is deterministic under the same seed across 100 runs', () => {
    const roster = createRoster(createSeededRng(1));
    for (let i = 0; i < 100; i += 1) {
      const a = generateProgram(roster, createSeededRng(i));
      const b = generateProgram(roster, createSeededRng(i));
      expect(a.rounds.map(r => r.lineup)).toEqual(b.rounds.map(r => r.lineup));
    }
  });
});
