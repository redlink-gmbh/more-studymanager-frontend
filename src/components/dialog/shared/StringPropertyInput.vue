/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { StringProperty } from '@/models/InputModels';
  import { computed, PropType, watch } from 'vue';
  import InputText from 'primevue/inputtext';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';
  import { useI18n } from 'vue-i18n';
  import { varifyPlaceholderText } from '@/utils/setPlaceholderText';

  const { t } = useI18n();

  const props = defineProps({
    property: {
      type: Object as PropType<StringProperty>,
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
    (e: 'onInputChange', stringProperty: StringProperty): void;
  }>();

  const placeholder = computed(() => {
    const placeholder = varifyPlaceholderText(
      props.property.description,
      'placeholder',
    );
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
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
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

    <InputText
      :id="property.id"
      v-model.trim="property.value"
      type="text"
      class="w-full"
      :required="property.required"
      :aria-describedby="`${property.id}-help`"
      :disabled="!editable || property.immutable"
      :placeholder="
        placeholder ? placeholder : $t('global.placeholder.enterTextValue')
      "
    />
  </div>
</template>
