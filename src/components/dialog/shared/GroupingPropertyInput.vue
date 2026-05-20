/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { GroupingProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';

  defineProps({
    property: {
      type: Object as PropType<GroupingProperty>,
      required: true,
    },
  });
</script>

<template>
  <div class="col-span-8 mt-4 mb-4">
    <hr class="text-gray-300 mt-10 mb-8" />
    <h5 class="mb-2">{{ $t(property.name) }}</h5>
    <p v-if="property.description && property.description !== 'inputModel.enterValue'">
      {{ $t(property.description) }}
    </p>
  </div>
</template>
