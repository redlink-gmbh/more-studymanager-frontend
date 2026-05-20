/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import {
    StringTemplateProperty,
    Property,
    IntegerRangeProperty,
  } from '../../../models/InputModels';
  import { PropType, computed, ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';

  const props = defineProps({
    property: {
      type: Object as PropType<StringTemplateProperty>,
      required: true,
    },
    allProperties: {
      type: Array as PropType<Property<any>[]>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', property: StringTemplateProperty): void;
  }>();

  const isEditing = ref(false);
  const originalValue = ref('');

  const startEditing = (): void => {
    originalValue.value = props.property.value ?? '';
    isEditing.value = true;
  };

  const cancelEditing = (): void => {
    props.property.value = originalValue.value;
    isEditing.value = false;
    updateValue();
  };

  const getPropertyByIdOrName = (
    idOrName: string,
  ): Property<any> | undefined => {
    return props.allProperties.find(
      (p) => p.id === idOrName || p.name === idOrName,
    );
  };

  const formatValue = (p: Property<any>): string => {
    if (isEditing.value) {
      return `<${p.id}>`;
    }

    if (p.value === undefined || p.value === null || p.value === '') {
      return `[${p.name || p.id}]`;
    }

    if (p instanceof IntegerRangeProperty) {
      const val = p.value as any;
      const min =
        val.min !== undefined
          ? val.min
          : val.lower !== undefined
            ? val.lower
            : 0;
      const max =
        val.max !== undefined
          ? val.max
          : val.upper !== undefined
            ? val.upper
            : 0;

      // Return a random value between min and max for the preview
      if (min === max) return `${min}`;
      const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
      return `${randomVal}`;
    }

    return String(p.value);
  };

  const renderedTemplate = computed(() => {
    let template = props.property.value || props.property.defaultValue || '';

    // Handle optional blocks [ ... <var> ... ]
    // This is simple implementation, might need refinement for nested or complex ones
    template = template.replace(
      /\[([^\]]*<([^>]+)>[^\]]*)\]/g,
      (match, inner, varName) => {
        const p = getPropertyByIdOrName(varName);
        if (p && p.value !== undefined && p.value !== null && p.value !== '') {
          return inner; // Keep the block if variable is set
        }
        return ''; // Remove the block if variable is not set
      },
    );

    return template;
  });

  const parts = computed(() => {
    const text = renderedTemplate.value;
    const regex = /<([^>]+)>/g;
    const result = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }
      const varName = match[1];
      const p = getPropertyByIdOrName(varName);
      result.push({
        type: 'variable',
        content: p ? formatValue(p) : `<${varName}>`,
        varName: p ? p.name || p.id : varName,
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return result;
  });

  const updateValue = (): void => {
    emit('onInputChange', props.property);
  };
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h6 class="font-bold">
        {{ $t(property.name) }}
      </h6>
    </div>

    <div v-if="isEditing" class="mb-4">
      <div class="relative mb-2 rounded border border-gray-300 bg-gray-50 p-4 flex justify-between items-center">
        <div class="w-full">
          <InputText
            v-model="property.value"
            class="w-full"
            autofocus
            @input="updateValue"
          />
        </div>
        <div class="flex items-center gap-1">
          <Button
            icon="pi pi-check"
            class="p-button-rounded p-button-text p-button-sm z-10"
            @click="isEditing = false"
          />
          <Button
            icon="pi pi-times"
            class="p-button-rounded p-button-text p-button-sm p-button-danger z-10"
            @click="cancelEditing"
          />
        </div>
      </div>
    </div>

    <div v-else class="preview-container relative">
      <div
        class="preview-box relative flex items-center justify-between rounded border border-gray-300 bg-gray-50 p-4"
      >
        <div class="flex flex-wrap items-end">
          <div v-for="(part, i) in parts" :key="i" class="flex items-end">
            <span v-if="part.type === 'text'" class="whitespace-pre-wrap">{{
              part.content
            }}</span>
            <div
              v-else
              class="variable-container relative mx-1 inline-block text-center"
            >
              <span
                class="color-primary mb-0.5 block text-[10px] leading-none font-semibold uppercase"
              >
                {{ $t(part.varName || '') }}
              </span>
              <div
                class="property-values rounded px-1 font-medium"
              >
                {{ part.content }}
              </div>
            </div>
          </div>
        </div>
        <Button
          v-if="editable"
          icon="pi pi-pencil"
          class="p-button-rounded p-button-text p-button-sm z-10"
          @click="startEditing"
        />
      </div>
    </div>
    <div
      v-if="
        property.description && property.description !== 'inputModel.enterValue'
      "
      class="text-xs text-gray-500"
    >
      {{ $t(property.description) }}
    </div>
  </div>
</template>

<style scoped>
  .preview-box {
    line-height: 2;
  }
  .variable-container {
    vertical-align: middle;
  }
</style>
