<script setup lang="ts">
import { computed } from 'vue';
import Panel from '@/shared/ui/Panel.vue';
import { useStore } from '@/store';
import HorseChip from './HorseChip.vue';

const store = useStore();
const horses = computed(() => store.state.roster.horses);
</script>

<template>
  <Panel title="Horses">
    <ul data-testid="horse-roster" class="flex flex-col gap-1">
      <li v-for="horse in horses" :key="horse.id" role="listitem">
        <HorseChip :horse="horse" />
      </li>
    </ul>
  </Panel>
</template>
