<script setup lang="ts">
  interface Props {
    isWarning?: boolean;
    errorMessage: string;
    errorLabel: string;
  }

  withDefaults(defineProps<Props>(), {
    isWarning: false,
  });
</script>

<template>
  <div
    v-if="errorMessage"
    :class="[
      'rounded border px-4 py-2',
      isWarning
        ? 'border-yellow-400 bg-yellow-50 p-4'
        : 'border-red-700 bg-red-50',
    ]"
  >
    <div
      :class="[
        'flex items-center gap-1',
        isWarning ? 'text-yellow-700' : 'text-red-700',
      ]">
      <i class="pi pi-exclamation-circle"></i>
      <span class="font-bold">{{ errorLabel }}</span>
    </div>
    <div
      :class="[
        'mt-1',
        isWarning ? 'text-yellow-700' : 'text-red-700',
      ]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
