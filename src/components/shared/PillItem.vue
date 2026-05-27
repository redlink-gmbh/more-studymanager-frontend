<script setup lang="ts">
  interface Props {
    label: string;
    textColor?: string;
    bgColor?: string;
  }

  defineProps<Props>();
</script>

<template>
  <div
    :class="[
      'pill rounded border px-2 py-1',
      textColor
        ? `border-${textColor} text-${textColor}`
        : 'border-gray-500 text-gray-500',
      bgColor ? `bg-${bgColor}` : 'bg-gray-100',
    ]"
  >
    {{ label }}
  </div>
</template>
