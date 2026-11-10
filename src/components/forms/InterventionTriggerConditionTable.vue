/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import { onMounted, onUpdated, Ref, ref, watch } from 'vue';
  import {
    MoreTableChoice,
    MoreTableColumn,
  } from '../../models/MoreTableModel';
  import {
    ComponentFactory,
    ComponentFactoryMeasurementsInner,
    Observation,
  } from '@gs';
  import {
    useComponentsApi,
    useObservationsApi,
  } from '../../composable/useApi';
  import {
    GroupConditionChange,
    InterventionChoice,
    InterventionTriggerConfig,
    InterventionTriggerUpdateData,
    InterventionTriggerUpdateItem,
  } from '../../models/InterventionTriggerModel';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../../composable/useErrorHandling';
  import { QueryDataType, QueryObjectInner } from '../../models/InputModels';
  import { useI18n } from 'vue-i18n';
  import {
    QUERY_DATA_TYPES,
    isValidQueryNumber,
    operatorsForQueryDataType,
    queryDataTypeFromMeasurement,
  } from '../../utils/queryDataTypeUtils';

  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();

  const { t } = useI18n();

  const props = defineProps({
    columns: {
      type: Array<MoreTableColumn>,
      required: true,
    },
    rows: {
      type: Array<any>,
      required: true,
    },
    nextGroupCondition: {
      type: String,
      default: '',
    },
    groupIndex: {
      type: Number,
      required: true,
    },
    studyId: {
      type: Number,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    rowOpenError: {
      type: String,
      required: true,
    },
  });

  watch(props.rows, () => {
    editingRows.value = [];

    props.rows.forEach((item) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  });

  const conditionValue: Ref<string> = ref(props.nextGroupCondition);
  const editingRows: Ref<Array<any>> = ref([]);
  const rowOpenError: Ref<string> = ref(props.rowOpenError);
  let observationList: Observation[] = [];

  async function getObservationList(): Promise<void> {
    await observationsApi
      .listObservations(props.studyId)
      .then((response: AxiosResponse) => {
        observationList = response.data;
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations'),
      );
  }
  await getObservationList();

  const observationValues: InterventionChoice[] =
    observationList.map((observation) => ({
      label: observation.title as string,
      value: observation.observationId as number,
    })) || [];

  onUpdated(() => {
    if (props.nextGroupCondition !== conditionValue.value) {
      conditionValue.value = props.nextGroupCondition;
    }
  });

  onMounted(() => {
    editingRows.value = [];

    props.rows.forEach((item) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  });

  const valueError: Ref<string> = ref('');

  const dataTypeOptions: MoreTableChoice[] = QUERY_DATA_TYPES.map((type) => ({
    label: t(`intervention.dialog.label.dataType.${type}`),
    value: type,
  }));

  const booleanOptions: MoreTableChoice[] = [
    { label: 'true', value: 'true' },
    { label: 'false', value: 'false' },
  ];

  async function getFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();

  const emit = defineEmits<{
    (e: 'onAddTriggerGroup', groupIndex: number): void;
    (e: 'onToggleRowEdit', event: InterventionTriggerUpdateItem): void;
    (e: 'onUpdateRowData', event: InterventionTriggerUpdateData): void;
    (e: 'onDeleteRow', event: InterventionTriggerUpdateItem): void;
    (e: 'onAddRow', event: InterventionTriggerUpdateItem): void;
    (e: 'onChangeGroupCondition', event: GroupConditionChange): void;
    (e: 'onError', errorMessage?: string): void;
    (e: 'onRowOpen', error: string): void;
  }>();

  function getPropertyOptions(
    trigger: InterventionTriggerConfig,
  ): ComponentFactoryMeasurementsInner[] {
    if (trigger.observationType) {
      return (
        factories.find(
          (cf: ComponentFactory) => cf.componentId === trigger.observationType,
        )?.measurements || []
      );
    }
    return [];
  }

  // lime survey answers are untyped strings, so only there the user chooses how values are compared
  function isDataTypeEditable(trigger: InterventionTriggerConfig): boolean {
    return trigger.observationType === 'lime-survey-observation';
  }

  function resolveDataType(trigger: InterventionTriggerConfig): QueryDataType {
    return isDataTypeEditable(trigger)
      ? (trigger.queryDataType ?? 'string')
      : queryDataTypeFromMeasurement(getOperator(trigger)?.type);
  }

  function getOperatorOptions(
    trigger: InterventionTriggerConfig,
  ): MoreTableChoice[] {
    return operatorsForQueryDataType(resolveDataType(trigger));
  }

  function applyDataType(trigger: InterventionTriggerConfig): void {
    trigger.queryDataType = resolveDataType(trigger);
    const operators = getOperatorOptions(trigger);
    if (!operators.some((o) => o.value === trigger.operator)) {
      trigger.operator = operators[0].value as string;
    }
  }

  function changeQueryDataType(
    trigger: InterventionTriggerConfig,
    type: QueryDataType,
  ): void {
    trigger.queryDataType = type;
    applyDataType(trigger);
    trigger.propertyValue = '';
  }

  function getOperator(
    trigger: InterventionTriggerConfig,
  ): ComponentFactoryMeasurementsInner {
    return getPropertyOptions(trigger).find(
      (cfmi: ComponentFactoryMeasurementsInner) =>
        cfmi.id === trigger.observationProperty,
    ) as ComponentFactoryMeasurementsInner;
  }

  function updateEditRows(): void {
    props.rows.forEach((item: InterventionTriggerConfig) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  }

  function changeObservationType(trigger: InterventionTriggerConfig): void {
    if (trigger.observationId) {
      const observation = findObservationById(
        trigger.observationId,
      ) as Observation;

      trigger.observationType = observation.type as string;

      const propertyOptions: ComponentFactoryMeasurementsInner[] =
        getPropertyOptions(trigger);

      trigger.observationProperty = propertyOptions[0]?.id || '';
      trigger.queryDataType = undefined;
      trigger.operator = '';
      applyDataType(trigger);

      trigger.propertyValue = '';
    }
  }
  function getObservationTitle(observationId: number): string {
    return (
      observationList.find(
        (observation) =>
          (observation.observationId as number) === observationId,
      )?.title || ''
    );
  }

  function findObservationById(observationId: number): Observation {
    return (
      observationList.find(
        (observation) =>
          (observation.observationId as number) === observationId,
      ) || {}
    );
  }

  function changeNextGroupCondition(): void {
    emit('onChangeGroupCondition', {
      groupIndex: props.groupIndex,
      value: conditionValue.value,
    });
  }

  function edit(trigger: InterventionTriggerConfig, index: number): void {
    rowOpenError.value = t('intervention.error.interventionRowIsOpen');
    emit('onRowOpen', rowOpenError.value);
    emit('onToggleRowEdit', {
      edit: true,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
    editingRows.value.push(trigger);
  }

  function cancel(trigger: InterventionTriggerConfig, index: number): void {
    valueError.value = '';
    rowOpenError.value = '';
    emit('onRowOpen', rowOpenError.value);
    emit('onToggleRowEdit', {
      data: trigger,
      edit: false,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
  }

  function save(trigger: QueryObjectInner, index: number): void {
    const returnTrigger: QueryObjectInner = trigger;
    returnTrigger.queryDataType = resolveDataType(trigger);

    if (returnTrigger.queryDataType === 'number') {
      if (!isValidQueryNumber(returnTrigger.propertyValue)) {
        valueError.value = t('intervention.error.invalidNumber');
        return;
      }
      returnTrigger.propertyValue = Number(returnTrigger.propertyValue);
    } else if (returnTrigger.queryDataType === 'boolean') {
      returnTrigger.propertyValue = String(returnTrigger.propertyValue);
    }
    valueError.value = '';
    rowOpenError.value = '';
    emit('onRowOpen', rowOpenError.value);
    emit('onUpdateRowData', {
      data: returnTrigger,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }

  function addRow(index: number): void {
    rowOpenError.value = t('intervention.error.interventionRowIsOpen');
    emit('onRowOpen', rowOpenError.value);
    emit('onAddRow', {
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }

  function deleteRow(index: number): void {
    emit('onDeleteRow', {
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }

  function addTriggerGroup(): void {
    emit('onAddTriggerGroup', props.groupIndex);
    updateEditRows();
  }
</script>

<template>
  <div class="trigger-condition-row">
    <DataTable
      v-model:editing-rows="editingRows"
      :value="rows"
      edit-mode="row"
      table-class="editable-cells-table"
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data, field }: { data: any; field: any }">
          <span v-if="field === 'observationId'">
            <span v-if="(data as any)[field] === undefined">{{
              $t('intervention.dialog.label.chooseObservation')
            }}</span>
            <span v-else>
              {{ getObservationTitle((data as any)[field]) }}
            </span>
          </span>
          <span v-else-if="field === 'queryDataType'">
            {{
              (data as any)['observationId'] === undefined
                ? '-'
                : $t(
                    `intervention.dialog.label.dataType.${resolveDataType(data)}`,
                  )
            }}
          </span>
          <span v-else>
            {{ (data as any)[field] }}
          </span>
        </template>
        <template #editor="{ data, field }: { data: any; field: any }">
          <Dropdown
            v-if="field === 'observationId'"
            v-model="(data as any)[field]"
            :options="observationValues"
            option-label="label"
            option-value="value"
            :filter="true"
            :placeholder="$t('intervention.dialog.label.chooseObservation')"
            @change="changeObservationType(data)"
          />

          <div v-else-if="(data as any)['observationId'] === undefined">-</div>

          <Dropdown
            v-else-if="
              column.field === 'observationProperty' &&
              (data as any)['observationType'] !== 'external-observation' &&
              (data as any)['observationType'] !== 'lime-survey-observation'
            "
            v-model="(data as any)[field]"
            :options="getPropertyOptions(data)"
            option-label="id"
            option-value="id"
            @change="applyDataType(data)"
          />

          <div
            v-else-if="column.field === 'queryDataType'"
            class="flex items-center gap-2"
          >
            <Dropdown
              :model-value="resolveDataType(data)"
              :options="dataTypeOptions"
              option-label="label"
              option-value="value"
              :disabled="!isDataTypeEditable(data)"
              @update:model-value="changeQueryDataType(data, $event)"
            />
            <span
              v-if="isDataTypeEditable(data)"
              v-tooltip.bottom="$t('intervention.dialog.hint.queryDataType')"
              class="pi pi-info-circle color-primary"
            ></span>
          </div>

          <Dropdown
            v-else-if="
              column.field === 'operator' && (data as any)['observationType']
            "
            v-model="(data as any)[field]"
            :options="getOperatorOptions(data)"
            option-label="label"
            option-value="value"
          />

          <Dropdown
            v-else-if="
              column.field === 'propertyValue' &&
              resolveDataType(data) === 'boolean'
            "
            v-model="(data as any)[field]"
            :options="booleanOptions"
            option-label="label"
            option-value="value"
          />

          <InputNumber
            v-else-if="
              getOperator(data) &&
              getOperator(data).type === 'DOUBLE' &&
              (data as any)['observationType'] !== 'gps-mobile-observation'
            "
            v-model="(data as any)[field]"
            :placeholder="$t('intervention.dialog.placeholder.enterNumber')"
          />
          <InputText
            v-else
            v-model="(data as any)[field]"
            :placeholder="$t('intervention.dialog.placeholder.enterValue')"
          />
        </template>
      </Column>
      <Column key="action" class="row-action text-end">
        <template #body="slotProps">
          <div v-if="!slotProps.data.editMode" class="text-end">
            <span class="mr-1.5"></span>
            <Button
              type="button"
              icon="pi pi-trash"
              class="btn-important"
              :disabled="!editable"
              @click="deleteRow(slotProps.index)"
            />
            <span class="mr-1.5"></span>
            <Button
              type="button"
              icon="pi pi-pencil"
              :disabled="!editable"
              @click="edit(slotProps.data, slotProps.index)"
            />
            <div v-if="slotProps.index + 1 < rows.length" class="inline p-3">
              &
            </div>
            <div v-else class="ml-1.5 inline">
              <Button
                type="button"
                icon="pi pi-plus"
                class="p-button p-3"
                :disabled="!editable"
                @click="addRow(slotProps.index)"
              />
            </div>
          </div>
          <div
            v-else-if="slotProps.data.editMode"
            class="flex items-center justify-center text-end"
          >
            <div class="error inline">
              <span
                class="pi pi-exclamation-circle"
                style="font-size: 2rem"
              ></span>
            </div>
            <div class="error m-2">
              {{ $t('moreTable.saveLine') }}
            </div>
            <Button
              type="button"
              icon="pi pi-check"
              @click="save(slotProps.data, slotProps.index)"
            />
            <span class="mr-1.5"></span>
            <Button
              type="button"
              icon="pi pi-times"
              class="btn-gray"
              @click="cancel(slotProps.data, slotProps.index)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-if="valueError" class="error my-4">
      {{ valueError }}
    </div>
    <div v-if="rowOpenError" class="error my-4">
      {{ rowOpenError }}
    </div>
    <div class="mt-5 flex justify-center text-center">
      <Button
        v-if="!nextGroupCondition"
        type="button"
        class="p-button"
        :disabled="!editable"
        @click="addTriggerGroup"
        ><span class="pi pi-plus mr-2"></span>
        {{ $t('intervention.dialog.label.addTriggerGroup') }}</Button
      >
      <Dropdown
        v-else
        v-model="conditionValue"
        :options="[
          { label: 'and', value: 'and' },
          { label: 'or', value: 'or' },
        ]"
        option-label="label"
        option-value="value"
        icon="pi pi-plus"
        :placeholder="$t('global.placeholder.chooseDropdownOptionDefault')"
        :disabled="!editable"
        @change="changeNextGroupCondition()"
      />
    </div>
  </div>
</template>
