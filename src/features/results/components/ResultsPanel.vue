<script setup lang="ts">
import { computed } from 'vue';
import Panel from '@/shared/ui/Panel.vue';
import { useStore } from '@/store';
import RoundResultCard from './RoundResultCard.vue';

const store = useStore();
const completed = computed(() => store.state.results.rounds);
</script>

<template>
  <Panel title="Results">
    <div data-testid="results-panel" class="flex flex-col gap-3">
      <p v-if="completed.length === 0" class="text-sm text-slate-500">
        Results appear here as each round ends.
      </p>
      <RoundResultCard
        v-for="result in completed"
        :key="result.roundIndex"
        :result="result"
        data-testid="round-result"
      />
    </div>
  </Panel>
</template>
