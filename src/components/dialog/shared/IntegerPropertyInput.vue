/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { IntegerProperty } from '@/models/InputModels';
  import { watch, computed } from 'vue';
  import InputNumber from 'primevue/inputnumber';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';
  import { useI18n } from 'vue-i18n';
  import { varifyPlaceholderText } from '@/utils/setPlaceholderText';

  const { t } = useI18n();

  interface Props {
    property: IntegerProperty;
    isPartOfTemplate?: boolean;
    editable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isPartOfTemplate: false,
    editable: true,
  });

  const emit = defineEmits<{
    (e: 'onInputChange', integerInput: IntegerProperty): void;
  }>();

  const placeholder = computed(() => {
    const placeholder = varifyPlaceholderText(props.property.description, 'placeholder');
    return placeholder ? t(placeholder) : undefined;
  });

  watch(
    () => props.property.value,
    () => {
      emit('onInputChange', props.property);
    },
  );
</script>

<template>
  <div class="integer-property-input flex flex-col gap-1">
    <h6 class="flex items-center font-bold">
      <label :for="property.id">
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

    <InputNumber
      :id="property.id"
      v-model="property.value"
      type="number"
      :required="property.required"
      :max="property.max"
      :min="property.min"
      :disabled="!editable || property.immutable"
      class="w-full"
      :aria-describedby="`${property.id}-help`"
      :placeholder="
        placeholder ? placeholder : $t('global.placeholder.enterTextValue')
      "
    />
  </div>
</template>

<style>
  @import '@/styles/components/custom-property-input-styles.css';
</style>
