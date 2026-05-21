<script setup lang="ts">
  import { computed, ComputedRef, PropType, ref } from 'vue';
  import {
    useComponentsApi,
    useObservationGroupsApi,
  } from '../composable/useApi';
  import {
    ComponentFactory,
    GoalTemplate,
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
  import ComponentDialog from './dialog/ComponentDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import { useGoalTemplateStore } from '@/stores/goalTemplateStore';
  import { useObservationGroupStore } from '@/stores/observationGroupStore';
  import GoalTemplateMessurementSection from '@/components/subComponents/GoalTemplateMeasssurementSection.vue';
  import GoalTemplateCategorySection from '@/components/subComponents/GoalTemplateCategorySection.vue';
  import { extractCurrentLimeDomain } from '@/utils/limeSurveyUtils';
  import DropdownPanelWithSearch from '@/components/shared/DropdownPanelWithSearch.vue';
  import { GoalTemplateMap } from '@/models/GoalTemplateMap';
  import { type ComponentTypeAction } from '@/models/ComponentTypeAction';

  const loader = useLoader();
  const { componentsApi } = useComponentsApi();
  const { observationGroupsApi } = useObservationGroupsApi();
  const { t } = useI18n();
  const goalTemplateStore = useGoalTemplateStore();
  const observationGroupStore = useObservationGroupStore();

  const goalTemplateList: ComputedRef<GoalTemplate[]> = computed(
    () => goalTemplateStore.goalTemplates ?? [],
  );

  const goalTemplateListMap: ComputedRef<GoalTemplateMap[]> = computed(() => {
    return goalTemplateStore.goalTemplatesMap.map(
      (item) =>
        ({
          ...item,
          goalTypeLabel: t(item.goalTypeLabel),
          categoryKind: t(`goaltemplate.factory.type.${item.categoryKind}Goal`),
          categoryTopics: goalTemplateStore.getTopicNames(
            item.categoryTopics ?? [],
          ),
          adheranceCheckLabels:
            (item.adherenceChecks?.map((ad: string) =>
              adherenceCheckOptions.value.find((opt) => opt.value === ad),
            ).filter(Boolean) as MoreTableChoice[]) ?? [],
          observationGroupValues: item.observationGroupIds?.length
            ? item.observationGroupIds.map((id) =>
                observationGroupStatuses.value?.find(
                  (groupStatus) => groupStatus.value === id.toString(),
                ),
              )
            : [],
        }) as any,
    );
  });

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

  const observationGroupStatuses: ComputedRef<MoreTableChoice[]> = computed(
    () =>
      observationGroupStore.observationGroups.map(
        (observationGroup) =>
          ({
            label: observationGroup.title,
            value: observationGroup.observationGroupId?.toString(),
          }) as MoreTableChoice,
      ),
  );

  const adherenceCheckOptions: ComputedRef<MoreTableChoice[]> = computed(() => {
    const options = goalTemplateStore.goalConfig?.schedule?.map((item) => ({
      label: t(
        `goaltemplate.goalTemplateList.meassurementTimes.times.${item.key}`,
      ),
      value: item.key ?? null,
    })) ?? [];
    return options as MoreTableChoice[];
  });

  const factories = ref<ComponentFactory[]>([]);

  async function getGoalFactories(): Promise<ComponentFactory[]> {
    factories.value = await componentsApi
      .listComponents('goalTemplate' as any)
      .then((response) => {
        return response.data ?? [];
      });
    return factories.value;
  }

  const goalTemplateTypes: ComputedRef<ComponentTypeAction[]> = computed(() =>
    factories.value
      .map((cf: ComponentFactory) => ({
        label: cf.title ? t(cf.title) : '',
        value: cf.componentId ?? '',
        description: cf.description
          ? t(cf.description, { link: extractCurrentLimeDomain() })
          : '',
        command: (): void => {
          openComponentDialog(t('goaltemplate.dialog.header.create'), {
            type: cf.componentId,
          } as GoalTemplate);
        },
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  const goalColumns: ComputedRef<MoreTableColumn[]> = computed(() => [
    {
      field: 'templateId',
      header: 'id',
      sortable: true,
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
      field: 'goalTypeLabel',
      header: t('observation.props.type'),
      sortable: true,
      filterable: true,
      columnWidth: '5vw',
    },
    {
      field: 'categoryTopics',
      header: t('goaltemplate.props.goalCategory'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'adheranceCheckLabels',
      header: t('goaltemplate.props.adhearanceCheck'),
      type: MoreTableFieldType.multiselect,
      arrayLabels: adherenceCheckOptions.value,
      editable: {
        enabled: actionsVisible,
        values: adherenceCheckOptions.value,
      },
      sortable: true,
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { enabled: true, values: groupStatuses },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.entireStudy'),
      columnWidth: '8vw',
    },
    {
      field: 'observationGroupValues',
      header: t('observationGroup.plural'),
      type: MoreTableFieldType.multiselect,
      arrayLabels: observationGroupStatuses.value,
      editable: {
        enabled: actionsVisible,
        values: observationGroupStatuses.value,
      },
      sortable: true,
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '10vw',
    },
  ]);

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
        dialog: (row: GoalTemplate) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('goaltemplate.dialog.deleteMsg.intro'),
              warningMsg: t('goaltemplate.dialog.deleteMsg.warning'),
              confirmMsg: t('goaltemplate.dialog.deleteMsg.confirm'),
              row: row,
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: (row as any).purpose,
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
    const row = action.row as GoalTemplate;
    switch (action.id) {
      case 'delete':
        deleteGoalTemplate(row);
        break;
      case 'clone':
        openComponentDialog(t('goaltemplate.dialog.header.clone'), row, true);
        break;
      case 'edit':
        openEditGoalTemplate(row.templateId);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  async function updateGoalTemplate(
    goalTemplate: GoalTemplateMap,
  ): Promise<void> {
    if (goalTemplate.observationGroupValues) {
      goalTemplate.observationGroupIds =
        goalTemplate.observationGroupValues.map((v: MoreTableChoice) =>
          parseInt(v.value!),
        );
    }
    if (goalTemplate.adheranceCheckLabels) {
      goalTemplate.adherenceChecks = goalTemplate.adheranceCheckLabels.map(
        (v: MoreTableChoice) => v.value as any,
      );
    }
    const cleanGoalTemplate = { ...goalTemplate } as any;
    delete cleanGoalTemplate.observationGroupValues;
    delete cleanGoalTemplate.goalTypeLabel;
    delete cleanGoalTemplate.categoryKind;
    delete cleanGoalTemplate.categoryTopics;
    delete cleanGoalTemplate.adheranceCheckLabels;
    delete cleanGoalTemplate.adhearanceCheckLabels;
    delete cleanGoalTemplate.appTitle;

    await goalTemplateStore.updateGoalTemplate(
      props.studyId,
      cleanGoalTemplate as GoalTemplate,
    );
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
    const cleanGoalTemplate = { ...newGoalTemplate } as any;
    if (cleanGoalTemplate.observationGroupValues) {
      cleanGoalTemplate.observationGroupIds =
        cleanGoalTemplate.observationGroupValues.map((v: MoreTableChoice) =>
          parseInt(v.value!),
        );
      delete cleanGoalTemplate.observationGroupValues;
    }
    if (cleanGoalTemplate.adheranceCheckLabels) {
      cleanGoalTemplate.adherenceChecks = cleanGoalTemplate.adheranceCheckLabels.map(
        (v: MoreTableChoice) => v.value as any,
      );
      delete cleanGoalTemplate.adheranceCheckLabels;
      delete cleanGoalTemplate.adhearanceCheckLabels;
    }
    if (cleanGoalTemplate.goalTypeLabel) delete cleanGoalTemplate.goalTypeLabel;
    if (cleanGoalTemplate.categoryKind) delete cleanGoalTemplate.categoryKind;
    if (cleanGoalTemplate.categoryTopics)
      delete cleanGoalTemplate.categoryTopics;
    if (cleanGoalTemplate.adhearanceCheckLabels)
      delete cleanGoalTemplate.adhearanceCheckLabels;
    if (cleanGoalTemplate.appTitle) delete cleanGoalTemplate.appTitle;

    await goalTemplateStore.addGoalTemplate(
      props.studyId,
      cleanGoalTemplate as GoalTemplate,
    );
  }

  function factoryForType(type?: string): ComponentFactory | undefined {
    return factories.value.find((f) => f.componentId === type);
  }

  function openComponentDialog(
    headerText: string,
    component?: GoalTemplate,
    clone?: boolean,
  ): void {
    dialog.open(ComponentDialog, {
      data: {
        groupStates: groupStatuses,
        component: component,
        factory: factoryForType(component?.type),
        componentType: 'goalTemplate',
        hasComponentCategories:
          goalTemplateStore.goalCategories as MoreTableChoice[],
        hasSimpleScheduler: goalTemplateStore.goalConfig?.schedule.map(
          (item) => {
            return {
              key: item.key,
              label: t(
                `goaltemplate.goalTemplateList.meassurementTimes.times.${item.key}`,
              ),
            };
          },
        ),
        simpleSchedulerValues: component?.adherenceChecks ?? [],
        closeWithEscape: false,
      },
      props: {
        header: headerText,
        style: {
          width: '70vw',
          maxHeight: '90vh',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        dismissableMask: false,
        draggable: false,
        closeOnEscape: false,
      },
      onClose: (options) => {
        if (options?.data) {
          const resultData = options.data as GoalTemplateMap;
          if (resultData.templateId) {
            if (clone) {
              addGoalTemplate(resultData);
            } else {
              updateGoalTemplate(resultData);
            }
          } else {
            addGoalTemplate(resultData);
          }
        }
      },
    });
  }

  function openEditGoalTemplate(goalTemplateId: number | undefined): void {
    const goalTemplate = goalTemplateList.value.find(
      (goal: GoalTemplate) => goal.templateId === goalTemplateId,
    );
    if (goalTemplate) {
      let dialogTitle = t('goaltemplate.dialog.header.edit');
      if (
        props.studyStatus === StudyStatus.Active ||
        props.studyStatus === StudyStatus.Closed
      ) {
        dialogTitle = t('goaltemplate.dialog.header.view');
      }
      openComponentDialog(dialogTitle, goalTemplate);
    }
  }

  const goalTemplateQuery = ref('');
  const filteredGoalTemplateTypes = computed(() => {
    const q = goalTemplateQuery.value.trim().toLowerCase();
    if (!q) return goalTemplateTypes.value;
    return goalTemplateTypes.value.filter((i: ComponentTypeAction) =>
      i.label.toLowerCase().includes(q),
    );
  });

  function selectedGoalTemplateTypes(item: ComponentTypeAction): void {
    item.command();
  }

  async function getGoalConfig(): Promise<void> {
    await goalTemplateStore.getGoalConfig(props.studyId);
  }

  listGoalTemplates();
  getGoalConfig();
  getGoalFactories();

  observationGroupsApi.listObservationGroups(props.studyId).then((response) => {
    observationGroupStore.observationGroups = response.data;
  });
</script>

<template>
  <div class="goalTemplateList">
    <div class="goal-description">
      <div class="mb-8">
        <div class="title w-full">
          <h3 class="font-bold">
            {{ $t('goaltemplate.goalTemplateList.title') }}
          </h3>
          <h4 class="text-lg">
            {{ $t('goaltemplate.goalTemplateList.description') }}
          </h4>
        </div>
      </div>
      <div class="global-goal-settings">
        <GoalTemplateMessurementSection :study-id="studyId" class="mb-8" />
        <GoalTemplateCategorySection
          class="mb-8"
          :study-id="studyId"
          :study-status="studyStatus"
        />
      </div>
    </div>
    <MoreTable
      row-id="templateId"
      :columns="goalColumns"
      :rows="goalTemplateListMap"
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
