<script setup lang="ts">
import { computed } from 'vue';
import Panel from '@/shared/ui/Panel.vue';
import { useStore } from '@/store';
import RoundPreview from './RoundPreview.vue';

const store = useStore();
const rounds = computed(() => store.state.program.current?.rounds ?? []);
</script>

<template>
  <Panel title="Schedule">
    <div data-testid="race-schedule" class="flex flex-col gap-2">
      <p v-if="rounds.length === 0" class="text-sm text-slate-500">
        Click <strong>Generate</strong> to draw a new program.
      </p>
      <RoundPreview v-for="round in rounds" :key="round.index" :round="round" />
    </div>
  </Panel>
</template>
