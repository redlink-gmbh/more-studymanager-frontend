<script setup lang="ts">
  import { IntegerRangeProperty } from '../../../models/InputModels';
  import { PropType, watch, computed } from 'vue';
  import InputNumber from 'primevue/inputnumber';
  import PartOfTemplateBadge from './PartOfTemplateBadge.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

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

  const placeholderLower = computed(() =>
    props.property.description
      ? t(`${props.property.description.split('.description')[0]}.placeholder-min`)
      : undefined,
  );

  const placeholderUpper = computed(() =>
    props.property.description
      ? t(`${props.property.description.split('.description')[0]}.placeholder-max`)
      : undefined,
  );

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
  <div class="flex flex-col gap-1">
      <div class="flex items-center gap-1">
        <h6 class="font-bold">
          <label :for="`${property.id}-lower`" class="font-bold">{{
            $t(property.name)
          }}</label>
        </h6>
        <PartOfTemplateBadge :visible="isPartOfTemplate" :component-id="property.id" />
      </div>
      <div
        v-if="
          property.description &&
          property.description !== 'inputModel.enterValue'
        "
      >
        {{ $t(property.description) }}
      </div>
    <div class="grid grid-cols-2 gap-4 items-center">
      <div class="flex items-center gap-2">
        <label :for="`${property.id}-lower`" class="text-xs text-gray-400 whitespace-nowrap">{{
          $t('global.labels.min')
        }}</label>
        <InputNumber
          :id="`${property.id}-lower`"
          v-model="(property.value as any).lower"
          class="flex-1"
          :class="{ 'p-invalid': property.required && (property.value?.lower === null || property.value?.lower === undefined) }"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
          :placeholder="
            placeholderLower ? placeholderLower : $t('global.placeholder.enterTextValue')
          "
        />
      </div>
      <div class="flex items-center gap-2">
        <label :for="`${property.id}-upper`" class="text-xs text-gray-400 whitespace-nowrap">{{
          $t('global.labels.max')
        }}</label>
        <InputNumber
          :id="`${property.id}-upper`"
          v-model="(property.value as any).upper"
          class="flex-1"
          :class="{ 'p-invalid': property.required && (property.value?.upper === null || property.value?.upper === undefined) }"
          :min-fraction-digits="0"
          :max-fraction-digits="0"
          :disabled="!editable || property.immutable"
          :min="property.minLimit"
          :max="property.maxLimit"
          :placeholder="
            placeholderUpper ? placeholderUpper : $t('global.placeholder.enterTextValue')
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

<style scoped>
  :deep(.p-inputnumber) {
    border: transparent;
    padding: 0;
    min-width: 0;
  }

  :deep(.p-inputnumber-input) {
    width: 100%;
    min-width: 0;
  }
</style>
