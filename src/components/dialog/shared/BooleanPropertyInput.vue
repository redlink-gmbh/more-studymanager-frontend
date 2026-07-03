/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { BooleanProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';

  const props = defineProps({
    property: {
      type: Object as PropType<BooleanProperty>,
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
    (e: 'onBooleanChange', boolean: boolean | undefined): void;
  }>();

  watch(
    () => props.property.value,
    () => {
      emit('onBooleanChange', props.property.value);
    },
  );
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold flex items-center gap-1">
      <label v-if="property.name" :for="property.id">
        {{ $t(property.name) }}<span v-if="property.required">*</span>
      </label>
      <PartOfTemplateBadge :visible="isPartOfTemplate" :component-id="property.id" />
    </h6>
    <div v-if="props.property.description" :id="`${property.id}-help`">
      {{ $t(props.property.description) }}
    </div>

    <div class="flex items-center">
      <Checkbox
        v-model="props.property.value"
        :label="property.name"
        class="mr-2"
        :required="property.required"
        :binary="true"
        :disabled="!editable || property.immutable"
      />
      {{ $t(property.name) }}
    </div>
  </div>
</template>
