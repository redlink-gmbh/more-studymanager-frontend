/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { BooleanProperty } from '../../../models/InputModels';
  import { PropType, ref, watch } from 'vue';
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

  const tempValue = ref(props.property.value ?? false);

  const emit = defineEmits<{
    (e: 'onBooleanChange', boolean: boolean): void;
  }>();

  watch(
    () => tempValue.value,
    () => {
      emit('onBooleanChange', !!tempValue.value);
    },
  );
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="flex items-center gap-1 font-bold">
      <label v-if="property.name" :for="property.id">
        {{ $t(property.name) }}<span v-if="property.required">*</span>
      </label>
      <PartOfTemplateBadge
        :visible="isPartOfTemplate"
        :component-id="property.id"
      />
    </h6>
    <div v-if="props.property.description" :id="`${property.id}-help`">
      {{ $t(props.property.description) }}
    </div>

    <div class="flex items-center">
      <Checkbox
        v-model="tempValue"
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
