/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { computed, PropType } from 'vue';
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
    return (
      usedInTemplate.value.has(property.id) ||
      usedInTemplate.value.has(property.name || '')
    );
  };

  interface PropertyGroup {
    prefix: string | null;
    properties: { property: Property<any>; originalIndex: number }[];
  }

  const groupedProperties = computed(() => {
    const groups: PropertyGroup[] = [];
    let currentGroup: PropertyGroup | null = null;

    props.propertyList.forEach((property, index) => {
      const dotIndex = property.id.indexOf('.');
      const prefix =
        dotIndex !== -1 ? property.id.substring(0, dotIndex) : null;

      if (prefix && currentGroup && currentGroup.prefix === prefix) {
        currentGroup.properties.push({ property, originalIndex: index });
      } else {
        currentGroup = {
          prefix: prefix,
          properties: [{ property, originalIndex: index }],
        };
        groups.push(currentGroup);
      }
    });

    return groups;
  });
</script>

<template>
  <div class="property-inputs" :class="styleModifier">
    <div
      v-for="(group, groupIndex) in groupedProperties"
      :key="groupIndex"
      :class="{
        'flex flex-col gap-4 md:flex-row':
          group.prefix && group.properties.length > 1,
        'mb-4': groupIndex < groupedProperties.length - 1,
      }"
    >
      <div
        v-for="({ property, originalIndex }, pIndex) in group.properties"
        :key="pIndex"
        :class="{ 'flex-1': group.prefix && group.properties.length > 1 }"
      >
        <StringPropertyInput
          v-if="property instanceof StringProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <StringTemplatePropertyInput
          v-if="property instanceof StringTemplateProperty"
          :property="property"
          :all-properties="propertyList"
          :editable="editable"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <StringTextPropertyInput
          v-if="property instanceof StringTextProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <IntegerPropertyInput
          v-if="property instanceof IntegerProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <IntegerRangePropertyInput
          v-if="property instanceof IntegerRangeProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <StringListPropertyInput
          v-if="property instanceof StringListProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-input-change="
            emit('onPropertyChange', {
              value: $event.value,
              index: originalIndex,
            })
          "
        />

        <BooleanPropertyInput
          v-if="property instanceof BooleanProperty"
          :property="property"
          :editable="editable"
          :is-part-of-template="isPartOfTemplate(property)"
          @on-boolean-change="
            emit('onPropertyChange', { value: $event, index: originalIndex })
          "
        />

        <ObservationPropertyInput
          v-if="property instanceof ObservationProperty"
          :property="property"
          :context="context"
          :editable="editable"
          @on-input-change="
            emit('onPropertyChange', { value: $event, index: originalIndex })
          "
        />

        <CronSchedulerConfiguration
          v-if="property instanceof CronProperty"
          :editable="editable"
          :cron-schedule="property.value"
          @on-valid-schedule="
            emit('onPropertyChange', { value: $event, index: originalIndex })
          "
          @on-error="
            emit('onError', {
              value: $event ? $event : '',
              index: originalIndex,
            })
          "
        />

        <InterventionTriggerConditions
          v-if="property instanceof DataCheckProperty"
          :trigger-conditions="property"
          :editable="editable"
          @on-emit-trigger-conditions="
            emit('onPropertyChange', { value: $event, index: originalIndex })
          "
          @on-error="
            emit('onError', {
              value: $event ? $event : '',
              index: originalIndex,
            })
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
  </div>
</template>
