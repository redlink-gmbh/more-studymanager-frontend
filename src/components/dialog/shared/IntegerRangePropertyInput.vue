<script setup lang="ts">
  import { IntegerRangeProperty } from '@/models/InputModels';
  import { watch, computed } from 'vue';
  import InputNumber from 'primevue/inputnumber';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';
  import { useI18n } from 'vue-i18n';
  import { varifyPlaceholderText } from '@/utils/setPlaceholderText';

  const { t } = useI18n();

  interface Props {
    property: IntegerRangeProperty;
    isPartOfTemplate?: boolean;
    editable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isPartOfTemplate: false,
    editable: true,
  });

  const emit = defineEmits<{
    (e: 'onInputChange', rangeInput: IntegerRangeProperty): void;
  }>();

  const placeholderLower = computed(() => {
    const placeholder = varifyPlaceholderText(props.property.description, 'placeholder-min',);
    return placeholder ? t(placeholder) : undefined;
  });

  const placeholderUpper = computed(() => {
    const placeholder = varifyPlaceholderText(props.property.description, 'placeholder-max');
    return placeholder ? t(placeholder) : undefined;
  });

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
  <div class="integer-range-property-input flex flex-col gap-1">
    <div class="flex items-center gap-1">
      <h6 class="font-bold">
        <label :for="`${property.id}-lower`" class="font-bold">{{
          $t(property.name)
        }}</label>
      </h6>
      <PartOfTemplateBadge
        :visible="isPartOfTemplate"
        :component-id="property.id"
      />
    </div>
    <div
      v-if="
        property.description && property.description !== 'inputModel.enterValue'
      "
    >
      {{ $t(property.description) }}
    </div>
    <div class="grid grid-cols-2 items-center gap-4">
      <div class="flex items-center gap-2">
        <label
          :for="`${property.id}-lower`"
          class="text-xs whitespace-nowrap text-gray-400"
          >{{ $t('global.labels.min') }}</label
        >
        <InputNumber
          :id="`${property.id}-lower`"
          v-model="(property.value as any).lower"
          class="flex-1"
          :class="{
            'p-invalid':
              property.required &&
              (property.value?.lower === null ||
                property.value?.lower === undefined),
          }"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
          :placeholder="
            placeholderLower
              ? placeholderLower
              : $t('global.placeholder.enterTextValue')
          "
        />
      </div>
      <div class="flex items-center gap-2">
        <label
          :for="`${property.id}-upper`"
          class="text-xs whitespace-nowrap text-gray-400"
          >{{ $t('global.labels.max') }}</label
        >
        <InputNumber
          :id="`${property.id}-upper`"
          v-model="(property.value as any).upper"
          class="flex-1"
          :class="{
            'p-invalid':
              property.required &&
              (property.value?.upper === null ||
                property.value?.upper === undefined),
          }"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
          :placeholder="
            placeholderUpper
              ? placeholderUpper
              : $t('global.placeholder.enterTextValue')
          "
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

<style>
  @import '@/styles/components/custom-property-input-styles.css';
</style>
