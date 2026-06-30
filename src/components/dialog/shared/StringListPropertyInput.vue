/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { StringListProperty } from '@/models/InputModels';
  import { PropType, ref, watch } from 'vue';
  import InputText from 'primevue/inputtext';
  import { useI18n } from 'vue-i18n';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';

  const { t } = useI18n();

  const props = defineProps({
    property: {
      type: Object as PropType<StringListProperty>,
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

  const inputValues = ref<string[]>(
    Array.from(
      { length: props.property.maxSize },
      (_, i) => props.property.value?.[i] ?? '',
    ),
  );

  const update = (value: string, index: number): void => {
    inputValues.value[index] = value;
    props.property.value = [...inputValues.value];
    emit('onInputChange', props.property);
  };

  const emit = defineEmits<{
    (e: 'onInputChange', stringListProperty: StringListProperty): void;
  }>();

  watch(
    () => props.property.value,
    () => {
      emit('onInputChange', props.property);
    },
    { deep: true, immediate: true },
  );
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label>
        {{ $t(property.name) }}<span v-if="property.required">*</span>
      </label>
      <PartOfTemplateBadge
        :visible="isPartOfTemplate"
        :component-id="property.id"
      />
    </h6>
    <div>{{ $t(props.property.description) }}</div>
    <div v-if="editable" class="flex w-full flex-col gap-1">
      <InputText
        v-for="(_item, index) in inputValues"
        :key="index"
        class="w-full"
        :value="inputValues[index]"
        type="text"
        :required="property.required"
        :disabled="!editable || property.immutable"
        :placeholder="t('global.labels.option', { value: index + 1 })"
        style="display: block"
        @input="update(($event.target as HTMLInputElement).value, index)"
      />
    </div>
    <div v-else-if="!editable" class="space-around flex flex-row">
      <div
        v-for="index in property.maxSize"
        :key="index"
        class="flex items-center"
      >
        <span>{{ property.value?.[index - 1] }}</span>
        <span
          v-if="property.value?.[index] && index !== property.maxSize"
          class="pi pi-circle-fill px-2"
          style="font-size: 5px"
        >
        </span>
      </div>
    </div>
  </div>
</template>
