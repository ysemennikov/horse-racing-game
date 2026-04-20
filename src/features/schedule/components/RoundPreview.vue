<script setup lang="ts">
import type { Round } from '../program';
import { computed } from 'vue';
import { useRoster } from '@/features/horses';
import HorseChip from '@/features/horses/components/HorseChip.vue';

const props = defineProps<{ round: Round }>();
const { byId } = useRoster();

const horses = computed(() =>
  props.round.lineup.flatMap((id) => {
    const h = byId.value.get(id);
    return h ? [h] : [];
  }),
);
</script>

<template>
  <div
    role="listitem"
    class="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3"
    :data-testid="`round-${round.index}`"
  >
    <header class="flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-slate-900">
        Round {{ round.index + 1 }}
      </h3>
      <span class="text-xs tabular-nums text-slate-600" :data-testid="`round-distance-${round.index}`">
        {{ round.distanceMeters }} m
      </span>
    </header>
    <div class="flex flex-wrap gap-1">
      <HorseChip v-for="horse in horses" :key="horse.id" :horse="horse" compact />
    </div>
  </div>
</template>
