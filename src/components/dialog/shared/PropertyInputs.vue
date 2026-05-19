/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType, computed } from 'vue';
  import {
    BooleanProperty,
    CronProperty,
    DataCheckProperty,
    GroupingProperty,
    IntegerProperty,
    IntegerRangeProperty,
    ObservationProperty,
    Property,
    StringListProperty,
    StringProperty,
    StringTemplateProperty,
    StringTextProperty,
    UnknownProperty,
  } from '../../../models/InputModels';
  import StringPropertyInput from './StringPropertyInput.vue';
  import StringTemplatePropertyInput from './StringTemplatePropertyInput.vue';
  import StringTextPropertyInput from './StringTextPropertyInput.vue';
  import StringListPropertyInput from './StringListPropertyInput.vue';
  import IntegerPropertyInput from './IntegerPropertyInput.vue';
  import IntegerRangePropertyInput from './IntegerRangePropertyInput.vue';
  import GroupingPropertyInput from './GroupingPropertyInput.vue';
  import {
    PropertyEmit,
    StringEmit,
  } from '../../../models/PropertyInputModels';
  import CronSchedulerConfiguration from '../../forms/CronSchedulerConfiguration.vue';
  import InterventionTriggerConditions from '../../forms/InterventionTriggerConditions.vue';
  import BooleanPropertyInput from './BooleanPropertyInput.vue';
  import ObservationPropertyInput from './ObservationPropertyInput.vue';
  import { Context } from '../../../models/ContextModel';
  import UnknownPropertyElement from '@/components/dialog/shared/UnknownPropertyElement.vue';

  const props = defineProps({
    propertyList: {
      type: Array as PropType<Property<any>[]>,
      required: true,
    },
    context: {
      type: Object as PropType<Context>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    styleModifier: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits<{
    (e: 'onPropertyChange', item: PropertyEmit): void;
    (e: 'onError', item: StringEmit): void;
  }>();

  const usedInTemplate = computed(() => {
    const ids = new Set<string>();
    props.propertyList.forEach((p) => {
      if (p instanceof StringTemplateProperty) {
        const template = p.value || p.defaultValue || '';
        const matches = template.match(/<([^>]+)>/g);
        if (matches) {
          matches.forEach((m) => {
            ids.add(m.slice(1, -1));
          });
        }
      }
    });
    return ids;
  });

  const isPartOfTemplate = (property: Property<any>): boolean => {
    return usedInTemplate.value.has(property.id) || usedInTemplate.value.has(property.name || '');
  };
</script>

<template>
  <div class="property-inputs" :class="styleModifier">
    <div v-for="(property, index) in propertyList" :key="index">
      <StringPropertyInput
        v-if="property instanceof StringProperty"
        :property="property"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringTemplatePropertyInput
        v-if="property instanceof StringTemplateProperty"
        :property="property"
        :all-properties="propertyList"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringTextPropertyInput
        v-if="property instanceof StringTextProperty"
        :property="property"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <IntegerPropertyInput
        v-if="property instanceof IntegerProperty"
        :property="property"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <IntegerRangePropertyInput
        v-if="property instanceof IntegerRangeProperty"
        :property="property"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringListPropertyInput
        v-if="property instanceof StringListProperty"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :property="property"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <BooleanPropertyInput
        v-if="property instanceof BooleanProperty"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :property="property"
        :editable="editable"
        :is-part-of-template="isPartOfTemplate(property)"
        @on-boolean-change="
          emit('onPropertyChange', { value: $event, index: index })
        "
      />

      <ObservationPropertyInput
        v-if="property instanceof ObservationProperty"
        :class="{ 'mb-4': index < propertyList.length - 1 }"
        :property="property"
        :context="context"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event, index: index })
        "
      />

      <CronSchedulerConfiguration
        v-if="property instanceof CronProperty"
        :class="{ 'mb-6': index < propertyList.length - 1 }"
        :editable="editable"
        :cron-schedule="property.value"
        @on-valid-schedule="
          emit('onPropertyChange', { value: $event, index: index })
        "
        @on-error="
          emit('onError', { value: $event ? $event : '', index: index })
        "
      />

      <InterventionTriggerConditions
        v-if="property instanceof DataCheckProperty"
        :class="{ 'mb-8': index < propertyList.length - 1 }"
        :trigger-conditions="property"
        :editable="editable"
        @on-emit-trigger-conditions="
          emit('onPropertyChange', { value: $event, index: index })
        "
        @on-error="
          emit('onError', { value: $event ? $event : '', index: index })
        "
      />

      <GroupingPropertyInput
        v-if="property instanceof GroupingProperty"
        :property="property"
      />

      <div v-if="property instanceof UnknownProperty">
        <UnknownPropertyElement :property="property" />
      </div>
    </div>
  </div>
</template>
