<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useGoalTemplateStore } from '@/stores/goalTemplateStore';
  import { useI18n } from 'vue-i18n';
  import Button from 'primevue/button';
  import Popover from 'primevue/popover';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Tag from 'primevue/tag';
  import { GoalTopic } from '@gs';

  const { t } = useI18n();
  const goalTemplateStore = useGoalTemplateStore();

  const props = defineProps({
    studyId: { type: Number, required: true },
  });

  const goalTopics = computed(() => goalTemplateStore.goalTopics);

  const overlayPanel = ref<InstanceType<typeof Popover> | null>(null);
  const isOpen = ref(false);
  const newTopicName = ref('');
  const newTopicDescription = ref('');
  const editingTopicKey = ref<string | null>(null);
  const editTopicName = ref('');
  const editTopicDescription = ref('');

  const toggleOverlay = (event: MouseEvent): void => {
    overlayPanel.value?.toggle(event);
    isOpen.value = !isOpen.value;
  };

  const handleAddTopic = async (): Promise<void> => {
    if (!newTopicName.value.trim()) return;

    const topic = {
      key: null,
      title: newTopicName.value,
      description: newTopicDescription.value,
    };

    await goalTemplateStore.createGoalTopic(props.studyId, topic as GoalTopic);
    newTopicName.value = '';
    newTopicDescription.value = '';
  };

  const startEdit = (topic: GoalTopic): void => {
    editingTopicKey.value = topic.key || null;
    editTopicName.value = topic.title;
    editTopicDescription.value = topic.description;
  };

  const saveEdit = async (key: string): Promise<void> => {
    if (!editTopicName.value.trim()) return;
    await goalTemplateStore.updateGoalTopic(props.studyId, key, {
      key,
      title: editTopicName.value,
      description: editTopicDescription.value,
    });
    editingTopicKey.value = null;
  };

  const deleteTopic = async (key: string | undefined): Promise<void> => {
    if (!key) return;
    await goalTemplateStore.deleteGoalTopic(props.studyId, key);
  };
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
        @click="toggleOverlay($event)"
      >
        <span>{{ t('goaltemplate.goalTemplateList.categories.add') }}</span>
        <span
          class="pi pi-angle-down ml-3"
          :class="{ 'rotate-180 transition-all ease-in-out': isOpen }"
        />
      </Button>
    </div>
    <p class="mb-4 text-sm text-gray-600">
      {{ t('goaltemplate.goalTemplateList.categories.description') }}
    </p>

    <div
      class="mb-6 flex flex-wrap gap-2 rounded border-gray-500 bg-gray-100 px-2"
    >
      <template v-if="goalTopics.length > 0">
        <div
          v-for="topic in goalTopics"
          :key="topic.key"
          class="flex items-center"
        >
          <Tag
            class="flex items-center gap-2 border-blue-200 bg-blue-100 px-3 py-2 text-blue-800"
            :title="topic.description"
          >
            <template v-if="editingTopicKey === topic.key">
              <div class="flex flex-col gap-1">
                <InputText
                  v-model="editTopicName"
                  size="small"
                  class="h-6 w-32"
                  @keyup.enter="saveEdit(topic.key)"
                />
                <Textarea
                  v-model="editTopicDescription"
                  size="small"
                  class="h-6 w-32 text-xs"
                  :placeholder="t('global.labels.description')"
                  @keyup.enter="saveEdit(topic.key)"
                />
              </div>
              <i
                class="pi pi-check cursor-pointer text-green-600"
                @click="saveEdit(topic.key)"
              ></i>
            </template>
            <template v-else>
              <div class="flex flex-col">
                <span class="font-semibold">{{ topic?.title || topic }}</span>
                <span v-if="topic?.description" class="text-[10px] opacity-70">{{
                  topic.description
                }}</span>
              </div>
              <i
                class="pi pi-pencil ml-1 cursor-pointer text-xs"
                @click="startEdit(topic)"
              ></i>
              <i
                class="pi pi-times ml-1 cursor-pointer text-xs"
                @click="deleteTopic(topic?.key)"
              ></i>
            </template>
          </Tag>
        </div>
      </template>
      <div v-else class="py-2 text-sm text-gray-500 italic">
        Noch keine Kategorien vorhanden
      </div>
    </div>

    <Popover ref="overlayPanel" :class="['w-[400px]']">
      <div class="p-2">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">{{
              t('goaltemplate.goalTemplateList.categories.add')
            }}</label>
            <InputText
              v-model="newTopicName"
              :placeholder="t('goaltemplate.goalTemplateList.categories.namePlaceholder')"
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
                t('goaltemplate.goalTemplateList.categories.descriptionPlaceholder')
              "
              class="w-full"
              @keyup.enter="handleAddTopic"
            />
          </div>
          <Button
            icon="pi pi-plus"
            :label="t('global.labels.add')"
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
