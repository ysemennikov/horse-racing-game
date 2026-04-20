<script setup lang="ts">
import type { RoundResult } from '@/features/results';
import { computed } from 'vue';
import { useRoster } from '@/features/horses';

const props = defineProps<{ result: RoundResult }>();
const { byId } = useRoster();

const rows = computed(() =>
  props.result.placements.map((p, i) => ({
    position: i + 1,
    horse: byId.value.get(p.horseId),
  })),
);
</script>

<template>
  <article class="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3">
    <header class="flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-slate-900">
        Round {{ result.roundIndex + 1 }}
      </h3>
      <span class="text-xs text-slate-500">{{ result.distanceMeters }} m</span>
    </header>
    <ol class="flex flex-col gap-0.5 text-sm">
      <li
        v-for="row in rows"
        :key="row.position"
        class="flex items-center gap-2"
        :data-testid="`placement-${result.roundIndex}-${row.position}`"
      >
        <span class="w-6 text-right tabular-nums text-slate-500">{{ row.position }}.</span>
        <span class="inline-block h-3 w-3 rounded-full" :style="{ background: row.horse?.color ?? '#999' }" />
        <span class="flex-1 truncate">{{ row.horse?.name ?? 'Unknown' }}</span>
      </li>
    </ol>
  </article>
</template>
