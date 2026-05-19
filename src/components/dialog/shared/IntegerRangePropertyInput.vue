/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { IntegerRangeProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import InputNumber from 'primevue/inputnumber';

  const props = defineProps({
    property: {
      type: Object as PropType<IntegerRangeProperty>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', rangeInput: IntegerRangeProperty): void;
  }>();

  watch(props.property.value, () => {
    emit('onInputChange', props.property);
  });
</script>

<template>
  <div>
    <div class="mb-1">
      <label :for="`${property.id}-min`" class="font-bold">{{
        $t(property.name)
      }}</label>
      <h6
        v-if="
          property.description &&
          property.description !== 'inputModel.enterValue'
        "
        class="text-xs text-gray-500"
      >
        {{ $t(property.description) }}
      </h6>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col">
        <label :for="`${property.id}-min`" class="text-xs text-gray-400">{{
          $t('global.labels.min')
        }}</label>
        <InputNumber
          :id="`${property.id}-min`"
          v-model="property.value.min"
          class="w-full"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
        />
      </div>
      <div class="flex flex-col">
        <label :for="`${property.id}-max`" class="text-xs text-gray-400">{{
          $t('global.labels.max')
        }}</label>
        <InputNumber
          :id="`${property.id}-max`"
          v-model="property.value.max"
          class="w-full"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
        />
      </div>
    </div>
    <small v-if="property.validate()" class="p-error">{{
      $t(property.validate() || '', {
        min: property.minLimit,
        max: property.maxLimit,
      })
    }}</small>
  </div>
</template>

<style scoped>
  :deep(.p-inputnumber) {
    border: transparent;
    padding: 0;
  }
</style>
