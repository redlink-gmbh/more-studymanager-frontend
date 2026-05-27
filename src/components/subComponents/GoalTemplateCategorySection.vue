<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    useGoalConfig,
    useCreateGoalTopic,
    useUpdateGoalTopic,
    useDeleteGoalTopic,
    StudyGoalConfigData,
  } from '@/api/goalQueries';
  import { useI18n } from 'vue-i18n';
  import Button from 'primevue/button';
  import Popover from 'primevue/popover';
  import InputText from 'primevue/inputtext';
  import { GoalTopic, StudyRole, StudyStatus } from '@gs';
  import MoreTable from '@/components/shared/MoreTable.vue';
  import { useToastService } from '@/composable/toastService';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableRowActionResult,
  } from '@/models/MoreTableModel';
  import DeleteMoreTableRowDialog from '@/components/dialog/DeleteMoreTableRowDialog.vue';
  import { useDialog } from 'primevue/usedialog';

  const { t } = useI18n();

  interface Props {
    studyId: number;
    studyStatus: StudyStatus;
    actionsDisabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    actionsDisabled: false,
  });
  const { showErrorToast } = useToastService();

  const { data: goalConfig } = useGoalConfig(props.studyId) as {
    data: { value: StudyGoalConfigData | undefined };
  };
  const { mutateAsync: createGoalTopicMutation } = useCreateGoalTopic();
  const { mutateAsync: updateGoalTopicMutation } = useUpdateGoalTopic();
  const { mutateAsync: deleteGoalTopicMutation } = useDeleteGoalTopic();

  const goalTopics = computed(() => goalConfig.value?.topics ?? []);

  const overlayPanel = ref<InstanceType<typeof Popover> | null>(null);
  const isOpen = ref(false);
  const newTopicName = ref('');
  const newTopicDescription = ref('');

  const toggleOverlay = (event: MouseEvent): void => {
    overlayPanel.value?.toggle(event);
    isOpen.value = !isOpen.value;
  };

  const handleAddTopic = async (): Promise<void> => {
    if (!newTopicName.value.trim()) return;

    const topic = {
      key: undefined,
      title: newTopicName.value,
      description: newTopicDescription.value,
    } as any;

    await createGoalTopicMutation({
      studyId: props.studyId,
      topic: topic as GoalTopic,
    }).then(() => {
      isOpen.value = false;
      overlayPanel.value?.hide();
    });
    newTopicName.value = '';
    newTopicDescription.value = '';
  };

  async function deleteTopic(topic: GoalTopic): Promise<void> {
    if (!topic.key) return;
    try {
      await deleteGoalTopicMutation({ studyId: props.studyId, key: topic.key });
    } catch (error: any) {
      if (error.response?.status === 409) {
        error.errorMessage = t(
          'goaltemplate.goalTemplateList.error.conflictUsedCategory',
        );
      } else {
        error.errorMessage = t('global.error.generic');
      }
      throw error;
    }
  }

  const goalCategoryColumns: MoreTableColumn[] = [
    {
      field: 'title',
      header: t('goaltemplate.props.categoryTitle'),
      editable: true,
    },
    {
      field: 'description',
      header: t('goaltemplate.props.description'),
      editable: true,
    },
  ];

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused ||
    props.studyStatus === StudyStatus.PausedPreview;

  const editableRoles: StudyRole[] = [
    StudyRole.StudyAdmin,
    StudyRole.StudyOperator,
  ];

  const dialog = useDialog();

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as GoalTopic;
    switch (action.id) {
      case 'delete':
        deleteTopic(row);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  function changeValueInPlace(topic: GoalTopic): void {
    if (topic && !!topic?.key) {
      updateGoalTopicMutation({
        studyId: props.studyId,
        key: topic.key,
        topic: topic,
      }).catch((error) => {
        if (error.response?.status === 409) {
          showErrorToast(
            t('goaltemplate.goalTemplateList.error.conflictUsedElement'),
          );
        }
      });
    }
  }

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('goaltemplate.goalTemplateTopicList.labels.delete'),
      tooltip: t('tooltips.moreTable.deleteGoalCategory'),
      icon: 'pi pi-trash',
      visible: () => actionsVisible,
      confirmDeleteDialog: {
        header: t('goaltemplate.dialog.header.delete'),
        message: t('goaltemplate.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t(
                'goaltemplate.goalTemplateTopicList.dialog.deleteMsg.intro',
              ),
              warningMsg: t(
                'goaltemplate.goalTemplateTopicList.dialog.deleteMsg.warning',
              ),
              confirmMsg: t(
                'goaltemplate.goalTemplateTopicList.dialog.deleteMsg.confirm',
              ),
              row: row,
              elTitle: row.title,
              elInfoTitle: t('global.labels.description'),
              elInfoDesc: row.description,
              onDelete: deleteTopic,
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
              if (options?.data && !options?.data?.key) {
                console.info('category section was closed successfully')
              }
            },
          }),
      },
    },
  ];
</script>

<template>
  <div class="goalTemplateCategories">
    <div class="mb-1 flex items-center justify-between">
      <h4 class="text-lg font-bold">
        {{ t('goaltemplate.goalTemplateList.categories.title') }}
      </h4>
      <Button
        type="button"
        class="flex shrink-0 items-center justify-between text-nowrap"
        :disabled="actionsDisabled"
        @click="toggleOverlay($event)"
      >
        <span>{{ t('goaltemplate.goalTemplateList.categories.add') }}</span>
        <span
          class="pi pi-angle-down ml-3"
          :class="{ 'rotate-180 transition-all ease-in-out': isOpen }"
        />
      </Button>
    </div>
    <p class="mb-4">
      {{ t('goaltemplate.goalTemplateList.categories.description') }}
    </p>

    <MoreTable
      row-id="key"
      :columns="goalCategoryColumns"
      :rows="goalTopics"
      :editable-access="actionsVisible"
      :row-actions="rowActions"
      :edit-access-roles="editableRoles"
      :empty-message="$t('goaltemplate.goalTemplateTopicList.emptyListMessage')"
      class="table-title-width"
      @on-action="executeAction($event)"
      @on-change="changeValueInPlace($event)"
    />

    <div
      class="mb-6 flex flex-wrap gap-2 rounded border-gray-500 bg-gray-100 px-2"
    >
      <template v-if="goalTopics.length > 0">
        <div
          v-for="topic in goalTopics"
          :key="topic.key"
          class="flex items-center"
        ></div>
      </template>
      <div v-else class="py-2 text-sm text-gray-500 italic">
        {{
          t('goaltemplate.goalTemplateList.categories.noCategoriesAvailable')
        }}
      </div>
    </div>

    <Popover ref="overlayPanel" class="w-100">
      <div class="p-2">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">{{
              t('goaltemplate.goalTemplateList.categories.add')
            }}</label>
            <InputText
              v-model="newTopicName"
              :placeholder="
                t('goaltemplate.goalTemplateList.categories.namePlaceholder')
              "
              class="w-full"
              @keyup.enter="handleAddTopic"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">{{
              t('global.labels.description')
            }}</label>
            <InputText
              v-model="newTopicDescription"
              :placeholder="
                t(
                  'goaltemplate.goalTemplateList.categories.descriptionPlaceholder',
                )
              "
              class="w-full"
              @keyup.enter="handleAddTopic"
            />
          </div>
          <Button
            icon="pi pi-plus"
            :label="t('goaltemplate.goalTemplateTopicList.labels.add')"
            size="small"
            class="mt-2"
            :disabled="!newTopicName.trim()"
            @click="handleAddTopic"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>
