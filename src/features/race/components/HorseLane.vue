<script setup lang="ts">
import type { Horse } from '@/features/horses';
import { computed } from 'vue';
import { useStore } from '@/store';

const props = defineProps<{ horse: Horse; distanceMeters: number }>();
const store = useStore();

const progressPercent = computed(() => {
  const meters = store.state.race.positions[props.horse.id] ?? 0;
  return Math.min(100, (meters / props.distanceMeters) * 100);
});
</script>

<template>
  <div
    class="relative flex h-8 items-center rounded-sm border border-slate-200 bg-slate-50 pl-2"
    :data-testid="`lane-${horse.id}`"
  >
    <span class="mr-2 w-20 truncate text-xs text-slate-600">{{ horse.name }}</span>
    <div class="relative flex-1 self-stretch">
      <div
        class="absolute top-1/2"
        :style="{ left: `${progressPercent}%`, transform: `translate(-${progressPercent}%, -50%)` }"
      >
        <div
          class="h-5 w-5 rounded-full border-2 border-white shadow"
          :style="{ background: horse.color }"
        />
      </div>
    </div>
  </div>
</template>
