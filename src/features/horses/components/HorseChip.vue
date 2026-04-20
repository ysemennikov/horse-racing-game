<script setup lang="ts">
import type { Horse } from '../horse';

defineProps<{ horse: Horse; compact?: boolean }>();
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
    :class="{ 'text-xs': compact }"
    :style="{ '--horse-color': horse.color }"
    :data-testid="`chip-${horse.id}`"
  >
    <span
      class="inline-block h-3 w-3 flex-none rounded-full"
      style="background: var(--horse-color)"
    />
    <span class="flex-1 truncate">{{ horse.name }}</span>
    <span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs tabular-nums text-slate-700">
      {{ horse.condition }}
    </span>
  </div>
</template>
