<script setup lang="ts">
import type { Round } from '@/features/schedule/program';
import { computed } from 'vue';
import { useRoster } from '@/features/horses';
import HorseLane from './HorseLane.vue';

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
  <div class="relative flex flex-col gap-1">
    <header class="flex items-center justify-between text-xs text-slate-600">
      <span>Round {{ round.index + 1 }}</span>
      <span>{{ round.distanceMeters }} m</span>
    </header>
    <div class="relative rounded-md border border-slate-300 bg-white p-2">
      <div class="absolute inset-y-0 right-2 w-px bg-red-400" aria-hidden="true" />
      <div class="flex flex-col gap-1">
        <HorseLane
          v-for="horse in horses"
          :key="horse.id"
          :horse="horse"
          :distance-meters="round.distanceMeters"
        />
      </div>
    </div>
  </div>
</template>
