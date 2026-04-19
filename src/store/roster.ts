import type { Module } from 'vuex';
import type { RootState } from './index';
import type { Horse } from '@/features/horses';
import { createRoster } from '@/features/horses';

export interface RosterState {
  horses: readonly Horse[];
}

export const roster: Module<RosterState, RootState> = {
  namespaced: true,
  state: () => ({ horses: createRoster() }),
};
