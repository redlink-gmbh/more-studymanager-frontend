/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { computed, ComputedRef, PropType, Ref, ref } from 'vue';
  import { useComponentsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    GoalTemplate,
    Observation,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '@gs';
  import {
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
    RowSelectionMode,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { useDialog } from 'primevue/usedialog';
  import ObservationDialog from '../components/dialog/ObservationDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import DropdownPanelWithSearch from '@/components/shared/DropdownPanelWithSearch.vue';
  import { useGoalTemplateStore } from '@/stores/goalTemplateStore';
  import GoalTemplateMessurementDropdown from '@/components/subComponents/GoalTemplateMessurementDropdown.vue';

  const loader = useLoader();
  const { componentsApi } = useComponentsApi();
  const { t } = useI18n();
  const goalTemplateStore = useGoalTemplateStore();

  const goalTemplatesList: Ref<GoalTemplate[]> = computed(
    () => goalTemplateStore.goalTemplates,
  );
  const goalTemplateSchedule: ComputedRef = computed(
    () => goalTemplateStore.goalConfig?.schedule ?? [],
  );

  const dialog = useDialog();

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'title',
    sortOrder: -1,
  };

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused ||
    props.studyStatus === StudyStatus.PausedPreview;

  const groupStatuses = props.studyGroups.map(
    (studyGroup) =>
      ({
        label: studyGroup.title,
        value: studyGroup.studyGroupId?.toString(),
      }) as MoreTableChoice,
  );
  groupStatuses.push({
    label: t('global.placeholder.entireStudy'),
    value: null,
  } as MoreTableChoice);

  async function getFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }

  const factories = ref<ComponentFactory[]>([]);

getFactories().then((data) => {
  factories.value = data;
});

  // ToDo: use groupTemplateTypes from factory
  const goalTemplateTypes: MoreTableChoice[] = computed(() =>
    goalTemplateStore.goalTypes
      .map(
        (goalType) =>
          ({
            label: t(`goal.factory.type.${goalType}`),
            value: goalType,
          }) as MoreTableChoice,
      )
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  const goalTemplateCategories: MoreTableChoice[] = computed(() =>
    goalTemplateStore.goalCategories.map((goalCategory) => ({
      label: t(`goal.factory.${goalCategory}.title`),
      description: t(`goal.factory.${goalCategory}.description`),
      value: goalCategory,
      command: (): void => {
        openGoalTemplateDialog(t('observation.dialog.header.create'), {
          type: goalCategory,
        });
      },
    })),
  );

  const goalColumns: MoreTableColumn[] = [
    {
      field: 'typeLabel',
      header: t('observation.props.type'),
      sortable: true,
      filterable: true,
      columnWidth: '5vw',
    },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: true,
      columnWidth: '10vw',
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      type: MoreTableFieldType.longtext,
      columnWidth: '10vw',
    },
    {
      field: 'goalTypeId',
      header: t('goal.props.goalType'),
      type: MoreTableFieldType.choice,
      editable: { enabled: true, values: goalTemplateTypes },
      sortable: true,
      filterable: true,
      columnWidth: '5vw',
    },
    {
      field: 'goalCategoryId',
      header: t('goal.props.goalCategory'),
      type: MoreTableFieldType.choice,
      editable: {
        enabled: true,
        values: goalTemplateCategories,
      },
      sortable: true,
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '10vw',
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { enabled: true, values: groupStatuses },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.entireStudy'),
      columnWidth: '5vw',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'clone',
      label: t('global.labels.clone'),
      tooltip: t('tooltips.moreTable.cloneGoalTemplate'),
      visible: () => actionsVisible,
    },
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteGoalTemplate'),
      visible: () => actionsVisible,
      confirmDeleteDialog: {
        header: t('goal.dialog.header.delete'),
        message: t('goal.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('goal.dialog.deleteMsg.intro'),
              warningMsg: t('goal.dialog.deleteMsg.warning'),
              confirmMsg: t('goal.dialog.deleteMsg.confirm'),
              row: row,
              /*elTitle: getObservationTypeString(row.type)
                ? `${row.title} (${getObservationTypeString(row.type)})`
                : row.title,*/
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('goal.dialog.header.delete'),
              style: {
                width: '50vw',
              },
              breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
              },
              modal: true,
              draggable: false,
            },
            onClose: (options) => {
              if (options?.data) {
                executeAction({
                  id: 'delete',
                  row: options.data,
                } as MoreTableRowActionResult);
              }
            },
          }),
      },
    },
  ];

  const endRowActions: MoreTableAction[] = [
    {
      id: 'edit',
      label: t('global.labels.edit'),
      icon: 'pi pi-cog',
      tooltip: t('tooltips.editBtn'),
    },
  ];

  async function listGoalTemplates(): Promise<void> {
    await goalTemplateStore.listGoalTemplates(props.studyId);
  }

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as Observation;
    switch (action.id) {
      case 'delete':
        deleteGoalTemplate(row);
        break;
      case 'clone':
        openGoalTemplateDialog(t('observation.dialog.header.clone'), row, true);
        break;
      case 'edit':
        openEditGoalTemplate(row.observationId);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  async function updateGoalTemplate(
    goalTemplate: GoalTemplate,
    fromDialog: boolean = false,
  ): Promise<void> {
    await goalTemplateStore.updateGoalTemplate(goalTemplate, fromDialog);
  }

  async function deleteGoalTemplate(
    reuqestGoalTemplate: GoalTemplate,
  ): Promise<void> {
    await goalTemplateStore.deleteGoalTemplate(
      props.studyId,
      reuqestGoalTemplate.templateId as number,
    );
  }

  async function addGoalTemplate(newGoalTemplate: GoalTemplate): Promise<void> {
    await goalTemplateStore.addGoalTemplate(props.studyId, newGoalTemplate);
  }

  function factoryForType(type?: string): ComponentFactory | undefined {
    return factories.value.find((f) => f.componentId === type);
  }

  function openGoalTemplateDialog(
    headerText: string,
    observation?: Observation,
    clone?: boolean,
  ): void {
    dialog.open(ObservationDialog, {
      data: {
        groupStates: groupStatuses,
        observation: observation,
        factory: factoryForType(observation?.type),
        closeWithEscape: false,
      },
      props: {
        header: headerText,
        style: {
          width: '50vw',
          maxHeight: '92vh',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
        closeOnEscape: false,
      },
      onClose: (options) => {
        if (options?.data) {
          if (options.data?.observationId) {
            if (clone) {
              addGoalTemplate(options.data as GoalTemplate);
            } else {
              updateGoalTemplate(options.data as GoalTemplate, true);
            }
          } else {
            addGoalTemplate(options.data as GoalTemplate);
          }
        }
      },
    });
  }

  function openEditGoalTemplate(goalTemplateId: number | undefined): void {
    const goalTemplate = goalTemplatesList.value.find(
      (goal: GoalTemplate) => goal.templateId === goalTemplateId,
    );
    if (goalTemplate) {
      let dialogTitle = t('observation.dialog.header.edit');
      if (
        props.studyStatus === StudyStatus.Active ||
        props.studyStatus === StudyStatus.Closed
      ) {
        dialogTitle = t('observation.dialog.header.view');
      }
      openGoalTemplateDialog(dialogTitle, goalTemplate);
    }
  }

  listGoalTemplates();

  const goalTemplateQuery = ref('');

  const filteredGoalTemplateTypes = computed(() => {
    const q = goalTemplateQuery.value.trim().toLowerCase();
    if (!q) return goalTemplateTypes;
    return goalTemplateTypes.value.filter((i) => i.label.toLowerCase().includes(q))
  });

  function selectedGoalTemplateTypes(item: any): any {
    item.command();
  }
</script>

<template>
  <div class="goalTemplateList">
    <MoreTable
      row-id="templateId"
      :title="$t('goal.goalTemplateList.title')"
      :subtitle="$t('goal.goalTemplateList.description')"
      :columns="goalColumns"
      :rows="goalTemplatesList"
      :row-actions="rowActions"
      :end-row-actions="endRowActions"
      :sort-options="sortOptions"
      :editable-access="actionsVisible"
      :loading="loader.isLoading.value"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('goal.goalTemplateList.emptyListMsg')"
      :component-factory="factories"
      :enable-row-selection="RowSelectionMode.Single"
      class="table-title-width"
      @on-select="openEditGoalTemplate($event)"
      @on-action="executeAction($event)"
      @on-change="updateGoalTemplate($event)"
    >
      <template #subTitleSection>
        <h3 class="mt-4 font-bold">
          {{ t('goal.goalTemplateList.meassurementTimes.title') }}
        </h3>
        <div>
          {{ t('goal.goalTemplateList.meassurementTimes.description') }}
        </div>
        <div class="mt-2 flex gap-2 items-center">
          <span v-if="goalTemplateSchedule.length === 0">
            {{ t('goal.goalTemplateList.meassurementTimes.notSet') }}
          </span>
          <span v-else>{{
            t('goal.goalTemplateList.meassurementTimes.set')
          }}</span>
          <GoalTemplateMessurementDropdown />
        </div>
      </template>
      <template #tableActions="{ isInEditMode }">
        <div>
          <dropdown-panel-with-search
            :dropdown-list="filteredGoalTemplateTypes"
            :button-label="t('observation.observationList.action.add')"
            :is-button-disabled="isInEditMode ? true : !actionsVisible"
            :button-icon="'pi pi-plus'"
            @on-query-change="goalTemplateQuery = $event"
            @on-select-option="selectedGoalTemplateTypes($event)"
          />
        </div>
      </template>
    </MoreTable>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped>
  :deep(.table-title-width) {
    .title {
      max-width: 80%;
    }
  }
</style>
