<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
}>();
</script>

<template>
  <span
    v-if="props.visible"
    class="property-values ml-2 rounded px-1 text-[10px] uppercase"
  >
    {{ $t('goaltemplate.property.amountOfGoal.partOfTemplate') }}
  </span>
</template>
