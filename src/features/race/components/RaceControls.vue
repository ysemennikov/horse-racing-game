<script setup lang="ts">
import { computed } from 'vue';
import PrimaryButton from '@/shared/ui/PrimaryButton.vue';
import { useStore } from '@/store';

const store = useStore();
const isRunning = computed(() => store.state.race.phase === 'running');
const canStart = computed(() => store.state.program.current !== null && !isRunning.value);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <PrimaryButton label="Generate" :disabled="isRunning" @click="store.dispatch('program/generate')" />
    <PrimaryButton label="Start" :disabled="!canStart" @click="store.dispatch('race/start')" />
  </div>
</template>
