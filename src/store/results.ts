import type { Module } from 'vuex';
import type { RootState } from './index';
import type { RoundResult } from '@/features/results';

export interface ResultsState {
  rounds: readonly RoundResult[];
}

export const results: Module<ResultsState, RootState> = {
  namespaced: true,
  state: () => ({ rounds: [] }),
  mutations: {
    APPEND(state, payload: RoundResult) {
      state.rounds = [...state.rounds, payload];
    },
    RESET(state) {
      state.rounds = [];
    },
  },
  actions: {
    append({ commit }, payload: RoundResult) {
      commit('APPEND', payload);
    },
    reset({ commit }) {
      commit('RESET');
    },
  },
};
