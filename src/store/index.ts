import type { Store } from 'vuex';
import type { ProgramState } from './program';
import type { RaceState } from './race';
import type { ResultsState } from './results';
import type { RosterState } from './roster';
import { createStore as createVuexStore, useStore as useVuexStore } from 'vuex';
import { program } from './program';
import { race } from './race';
import { results } from './results';
import { roster } from './roster';

export interface RootState {
  roster: RosterState;
  program: ProgramState;
  race: RaceState;
  results: ResultsState;
}

export const store: Store<RootState> = createVuexStore<RootState>({
  modules: { roster, program, race, results },
});

export function useStore(): Store<RootState> {
  return useVuexStore<RootState>();
}
