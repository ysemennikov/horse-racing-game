<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <header class="border-b border-slate-200 bg-slate-50 px-4 py-2">
      <h2 class="text-sm font-semibold tracking-wide text-slate-700 uppercase">
        {{ title }}
      </h2>
    </header>
    <div class="flex-1 overflow-auto p-4">
      <slot />
    </div>
  </section>
</template>
