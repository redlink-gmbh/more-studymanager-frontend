<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  componentId?: string;
}>();
</script>

<template>
  <span
    v-if="props.visible"
    class="color-primary font-bold text-md rounded px-1 text-[0.8rem]"
  >
    {{ componentId ? `<${componentId}>` :$t('goaltemplate.property.amountOfGoal.partOfTemplate') }}
  </span>
</template>
