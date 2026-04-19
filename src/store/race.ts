import type { Module } from 'vuex';
import type { RootState } from './index';
import type { Positions } from '@/features/race/raceLoop';
import { computeFinishOrder } from '@/features/race/finishOrder';
import { runRound } from '@/features/race/raceLoop';

export type RacePhase = 'idle' | 'running' | 'finished';

export interface RaceState {
  phase: RacePhase;
  activeRoundIndex: number | null;
  positions: Readonly<Record<string, number>>;
}

export const race: Module<RaceState, RootState> = {
  namespaced: true,
  state: () => ({ phase: 'idle', activeRoundIndex: null, positions: {} }),
  mutations: {
    SET_PHASE(state, phase: RacePhase) {
      state.phase = phase;
    },
    SET_ACTIVE_ROUND(state, index: number | null) {
      state.activeRoundIndex = index;
    },
    SET_POSITIONS(state, positions: Positions) {
      state.positions = positions;
    },
  },
  actions: {
    reset({ commit }) {
      commit('SET_PHASE', 'idle');
      commit('SET_ACTIVE_ROUND', null);
      commit('SET_POSITIONS', {});
    },
    async start({ state, commit, dispatch, rootState }) {
      const program = rootState.program.current;
      if (!program || state.phase === 'running')
        return;

      commit('SET_PHASE', 'running');
      const byId = new Map(rootState.roster.horses.map(h => [h.id, h]));

      for (const round of program.rounds) {
        commit('SET_ACTIVE_ROUND', round.index);
        commit('SET_POSITIONS', Object.fromEntries(round.lineup.map(id => [id, 0])));
        const { finishTimes } = await runRound(round, byId, positions => commit('SET_POSITIONS', positions));
        await dispatch('results/append', computeFinishOrder(round, finishTimes, byId), { root: true });
      }

      commit('SET_PHASE', 'finished');
    },
  },
};
