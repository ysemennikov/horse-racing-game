import type { Horse } from './horse';
import { computed } from 'vue';
import { useStore } from '@/store';

export function useRoster() {
  const store = useStore();
  const horses = computed(() => store.state.roster.horses);
  const byId = computed(() => new Map<string, Horse>(horses.value.map(h => [h.id, h])));
  return { horses, byId };
}
