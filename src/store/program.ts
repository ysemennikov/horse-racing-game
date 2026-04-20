import type { Module } from 'vuex';
import type { RootState } from './index';
import type { RaceProgram } from '@/features/schedule/program';
import { generateProgram } from '@/features/schedule/programGenerator';

export interface ProgramState {
  current: RaceProgram | null;
}

export const program: Module<ProgramState, RootState> = {
  namespaced: true,
  state: () => ({ current: null }),
  mutations: {
    SET(state, payload: RaceProgram | null) {
      state.current = payload;
    },
  },
  actions: {
    generate({ commit, dispatch, rootState }) {
      commit('SET', generateProgram(rootState.roster.horses));
      dispatch('results/reset', undefined, { root: true });
      dispatch('race/reset', undefined, { root: true });
    },
  },
};
