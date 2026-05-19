/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { IntegerRangeProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import InputNumber from 'primevue/inputnumber';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';

  const props = defineProps({
    property: {
      type: Object as PropType<IntegerRangeProperty>,
      required: true,
    },
    isPartOfTemplate: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', rangeInput: IntegerRangeProperty): void;
  }>();

  watch(
    () => props.property.value?.lower,
    (newLower) => {
      if (
        newLower !== undefined &&
        newLower !== null &&
        props.property.value?.upper !== undefined &&
        props.property.value.upper !== null
      ) {
        if (newLower > props.property.value.upper) {
          props.property.value.upper = newLower;
        }
      }
      if (props.isPartOfTemplate) {
        emit('onInputChange', props.property);
      }
    },
  );

  watch(
    () => props.property.value?.upper,
    (newUpper) => {
      if (
        newUpper !== undefined &&
        newUpper !== null &&
        props.property.value?.lower !== undefined &&
        props.property.value.lower !== null
      ) {
        if (newUpper < props.property.value.lower) {
          props.property.value.lower = newUpper;
        }
      }
      if (props.isPartOfTemplate) {
        emit('onInputChange', props.property);
      }
    },
  );
</script>

<template>
  <div>
    <div class="mb-1">
      <div class="flex items-center">
        <label :for="`${property.id}-lower`" class="font-bold">{{
          $t(property.name)
        }}</label>
        <PartOfTemplateBadge :visible="isPartOfTemplate" />
      </div>
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
        <label :for="`${property.id}-lower`" class="text-xs text-gray-400">{{
          $t('global.labels.min')
        }}</label>
        <InputNumber
          :id="`${property.id}-lower`"
          v-model="property.value.lower"
          class="w-full"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
        />
      </div>
      <div class="flex flex-col">
        <label :for="`${property.id}-upper`" class="text-xs text-gray-400">{{
          $t('global.labels.max')
        }}</label>
        <InputNumber
          :id="`${property.id}-upper`"
          v-model="property.value.upper"
          class="w-full"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
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
