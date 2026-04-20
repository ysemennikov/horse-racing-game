<script setup lang="ts">
import HorseRoster from '@/features/horses/components/HorseRoster.vue';
import RaceArena from '@/features/race/components/RaceArena.vue';
import ResultsPanel from '@/features/results/components/ResultsPanel.vue';
import RaceSchedule from '@/features/schedule/components/RaceSchedule.vue';
</script>

<template>
  <main class="min-h-screen bg-slate-50 p-6">
    <h1 class="sr-only">
      Horse Racing Game
    </h1>
    <div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-4 lg:items-start">
      <div class="lg:col-span-1">
        <HorseRoster />
      </div>
      <div class="flex flex-col gap-4 lg:col-span-2">
        <RaceArena />
        <ResultsPanel />
      </div>
      <div class="lg:col-span-1">
        <RaceSchedule />
      </div>
    </div>
  </main>
</template>
