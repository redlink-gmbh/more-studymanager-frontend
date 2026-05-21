<script setup lang="ts">
  import { GroupingProperty } from '@/models/InputModels';

  interface Props {
    property: GroupingProperty;
  }

  defineProps<Props>();
</script>

<template>
  <div class="col-span-8 mt-4 mb-4">
    <hr class="mt-10 mb-8 text-gray-300" />
    <h5 class="mb-2">{{ $t(property.name) }}</h5>
    <p
      v-if="
        property.description && property.description !== 'inputModel.enterValue'
      "
    >
      {{ $t(property.description) }}
    </p>
  </div>
</template>
