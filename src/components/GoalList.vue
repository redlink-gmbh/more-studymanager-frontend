/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { computed, ComputedRef, PropType, ref } from 'vue';
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
  import { useGoalTemplateStore } from '@/stores/goalTemplateStore';
  import GoalTemplateMessurementDropdown from '@/components/subComponents/GoalTemplateMessurementDropdown.vue';
  import GoalTemplateCategoryHandling from '@/components/subComponents/GoalTemplateCategoryHandling.vue';
  import { extractCurrentLimeDomain } from '@/utils/limeSurveyUtils';
  import DropdownPanelWithSearch from '@/components/shared/DropdownPanelWithSearch.vue';

  const loader = useLoader();
  const { componentsApi } = useComponentsApi();
  const { t } = useI18n();
  const goalTemplateStore = useGoalTemplateStore();

  const goalTemplatesList: ComputedRef<GoalTemplate[]> = computed(
    () => goalTemplateStore.goalTemplates ?? [],
  );
  const goalTemplateSchedule: ComputedRef<any[]> = computed(
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

  const factories = ref<ComponentFactory[]>([]);

  async function getGoalFactories(): Promise<ComponentFactory[]> {
    factories.value = await componentsApi
      .listComponents('goalTemplate')
      .then((response) => {
        console.info('GOAL FACTORIES:', JSON.stringify(response.data, null, 2));
        return response.data ?? [];
      });
  }

  // ToDo: use groupTemplateTypes from factory
  const goalTemplateTypes: any[] = computed(() =>
    factories.value
      .map((cf: ComponentFactory) => ({
        label: cf.title ? t(cf.title) : '',
        value: cf.componentId,
        description: cf.description
          ? t(cf.description, { link: extractCurrentLimeDomain() })
          : '',
        command: (): void => {
          openGoalTemplateDialog(t('observation.dialog.header.create'), {
            type: cf.componentId,
          });
        },
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  const goalTemplateCategories: MoreTableChoice[] = computed(() =>
    goalTemplateStore.goalCategories.map((goalCategory) => ({
      label: t(`goaltemplate.factory.${goalCategory}.title`),
      description: t(`goaltemplate.factory.${goalCategory}.description`),
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
      header: t('goaltemplate.props.goalType'),
      type: MoreTableFieldType.choice,
      editable: { enabled: true, values: goalTemplateTypes },
      sortable: true,
      filterable: true,
      columnWidth: '5vw',
    },
    {
      field: 'goalCategoryId',
      header: t('goaltemplate.props.goalCategory'),
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
        header: t('goaltemplate.dialog.header.delete'),
        message: t('goaltemplate.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('goaltemplate.dialog.deleteMsg.intro'),
              warningMsg: t('goaltemplate.dialog.deleteMsg.warning'),
              confirmMsg: t('goaltemplate.dialog.deleteMsg.confirm'),
              row: row,
              /*elTitle: getObservationTypeString(row.type)
                    ? `${row.title} (${getObservationTypeString(row.type)})`
                    : row.title,*/
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('goaltemplate.dialog.header.delete'),
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

  const goalTemplateQuery = ref('');
  const filteredGoalTemplateTypes = computed(() => {
    const q = goalTemplateQuery.value.trim().toLowerCase();
    if (!q) return goalTemplateTypes.value;
    return goalTemplateTypes.value.filter((i: any) =>
      i.label.toLowerCase().includes(q),
    );
  });

  function selectedGoalTemplateTypes(item: any): any {
    item.command();
  }

  async function getGoalConfig(): Promise<void> {
    await goalTemplateStore.getGoalConfig(props.studyId);
  }

  listGoalTemplates();
  getGoalConfig();
  getGoalFactories();
</script>

<template>
  <div class="goalTemplateList">
    <MoreTable
      row-id="templateId"
      :title="$t('goaltemplate.goalTemplateList.title')"
      :subtitle="$t('goaltemplate.goalTemplateList.description')"
      :columns="goalColumns"
      :rows="goalTemplatesList"
      :row-actions="rowActions"
      :end-row-actions="endRowActions"
      :sort-options="sortOptions"
      :editable-access="actionsVisible"
      :loading="loader.isLoading.value"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('goaltemplate.goalTemplateList.emptyListMsg')"
      :component-factory="factories"
      :enable-row-selection="RowSelectionMode.Single"
      class="table-title-width"
      @on-select="openEditGoalTemplate($event)"
      @on-action="executeAction($event)"
      @on-change="updateGoalTemplate($event)"
    >
      <template #subTitleSection>
        <div class="mt-4 mb-1 flex items-center justify-between">
          <h4 class="text-lg font-bold">
            {{ t('goaltemplate.goalTemplateList.meassurementTimes.title') }}
          </h4>
          <GoalTemplateMessurementDropdown :study-id="studyId" />
        </div>
        <div class="mb-4 text-sm text-gray-600">
          {{ t('goaltemplate.goalTemplateList.meassurementTimes.description') }}
        </div>
        <div
          class="mb-6 flex items-center gap-2 rounded border-gray-500 bg-gray-100 px-2"
        >
          <div
            v-if="goalTemplateSchedule.length === 0"
            class="py-2 text-sm text-gray-500 italic"
          >
            {{ t('goaltemplate.goalTemplateList.meassurementTimes.notSet') }}
          </div>
          <span v-else>{{
            t('goaltemplate.goalTemplateList.meassurementTimes.set')
          }}</span>
        </div>

        <GoalTemplateCategoryHandling class="mt-4" :study-id="studyId" />
      </template>
      <template #tableActions="{ isInEditMode }">
        <div>
          <dropdown-panel-with-search
            :dropdown-list="filteredGoalTemplateTypes"
            :button-label="t('goaltemplate.goalTemplateList.action.add')"
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
