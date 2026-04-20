<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>
