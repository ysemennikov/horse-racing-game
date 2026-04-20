<script setup lang="ts">
import { computed } from 'vue';
import Panel from '@/shared/ui/Panel.vue';
import { useStore } from '@/store';
import RaceControls from './RaceControls.vue';
import RaceTrack from './RaceTrack.vue';

const store = useStore();
const activeRound = computed(() => {
  const idx = store.state.race.activeRoundIndex;
  if (idx === null)
    return null;
  return store.state.program.current?.rounds[idx] ?? null;
});
</script>

<template>
  <Panel title="Race">
    <div data-testid="race-arena" class="flex flex-col gap-4">
      <RaceControls />
      <RaceTrack v-if="activeRound" :round="activeRound" />
      <p v-else class="text-sm text-slate-500">
        Press <strong>Generate</strong>, then <strong>Start</strong>.
      </p>
    </div>
  </Panel>
</template>
