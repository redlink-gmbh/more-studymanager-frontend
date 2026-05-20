<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  componentId?: string;
}>();
</script>

<template>
  <span
    v-if="props.visible"
    class="color-primary font-black ml-2 rounded px-1 text-[10px] uppercase"
  >
    {{ componentId ? `<${componentId}>` :$t('goaltemplate.property.amountOfGoal.partOfTemplate') }}
  </span>
</template>
