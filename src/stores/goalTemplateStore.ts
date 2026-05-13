import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import {
  GoalTemplate,
  GoalTopic,
  StudyGoalConfig,
  StudyGoalConfigData,
} from '@gs';
import { useGoalsApi } from '../composable/useApi';
import { useErrorHandling } from '../composable/useErrorHandling';
import { AxiosError } from 'axios';

export const useGoalTemplateStore = defineStore('goalTemplate', () => {
  const { goalsApi } = useGoalsApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const goalTemplates: Ref<GoalTemplate[]> = ref([]);
  const goalConfig: Ref<StudyGoalConfigData | undefined> = ref();
  const goalTopics: Ref<GoalTopic[]> = ref([]);

  //ToDo get goalTypeStatuses and goalCategoryStatuses from api and store
  const goalTypes = [
   'behavioralGoal',
   'outcomeGoal'
  ];
  const goalCategories = [
    'nutrition',
    'smoking'
  ];

  // Actions
  async function listGoalTemplates(studyId: number): Promise<void> {
    console.info('listGoalTemplates from goalTemplateStore');
    goalTemplates.value = await goalsApi
      .listGoalTemplates(studyId)
      .then((response) => {
        console.info('listGoalTemplates response', response.data);
        return response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list goal templates');
        return [];
      });
  }

  async function addGoalTemplate(
    studyId: number,
    goalTemplate: GoalTemplate,
  ): Promise<void> {
    await goalsApi
      .addGoalTemplate(studyId, goalTemplate)
      .then((response) => goalTemplates.value.push(response.data))
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot add goal template'),
      );
  }

  async function updateGoalTemplate(
    studyId: number,
    goalTemplate: GoalTemplate,
  ): Promise<void> {
    const position = goalTemplates.value.findIndex(
      (template) => template.templateId === goalTemplate.templateId,
    );
    if (position > -1) {
      await goalsApi
        .updateGoalTemplate(
          studyId,
          goalTemplate.templateId as number,
          goalTemplate,
        )
        .then((response) =>
          goalTemplates.value.splice(position, 1, response.data),
        )
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update goal template'),
        );
    }
  }

  async function deleteGoalTemplate(
    studyId: number,
    templateId: number,
  ): Promise<void> {
    await goalsApi
      .deleteGoalTemplate(studyId, templateId)
      .then(() => {
        const position = goalTemplates.value.findIndex(
          (template) => template.templateId === templateId,
        );
        if (position > -1) {
          goalTemplates.value.splice(position, 1);
        }
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot delete goal template'),
      );
  }

  async function getGoalConfig(studyId: number): Promise<void> {
    console.info('template store, getGoalConfig');
    await goalsApi
      .getGoalConfig(studyId)
      .then((response) => {
        goalConfig.value = response.data;
        if (response.data.topics) {
          goalTopics.value = response.data.topics;
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot get goal configuration');
      });
  }

  async function setGoalConfig(
    studyId: number,
    config: StudyGoalConfig,
  ): Promise<void> {
    console.info('template store, setGoalConfig', config, studyId);
    await goalsApi
      .setGoalConfig(studyId, config)
      .then((response) => {
        goalConfig.value = response.data;
        if (response.data?.topics) {
          goalTopics.value = response.data.topics;
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot update goal configuration');
      });
  }

  // goal category/topic rud

  async function createGoalTopic(
    studyId: number,
    topic: GoalTopic,
  ): Promise<void> {
    console.info('createGoalTopic:', studyId, topic);
    await goalsApi
      .createGoalTopic(studyId, topic)
      .then(async (response) => {
        goalTopics.value.push(response.data);
        await getGoalConfig(studyId);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot create goal topic');
      });
  }

  async function updateGoalTopic(
    studyId: number,
    key: string,
    topic: GoalTopic,
  ): Promise<void> {
    console.info('updateGoalTopic: ', studyId, key, topic);
    await goalsApi
      .updateGoalTopic(studyId, key, topic)
      .then((response) => {
        const index = goalTopics.value.findIndex((t) => t.key === key);
        if (index > -1) {
          goalTopics.value.splice(index, 1, response.data);
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot update goal topic');
      });
  }

  async function deleteGoalTopic(studyId: number, key: string): Promise<void> {
    console.info('deleteGoalTopic: ', studyId, key);
    await goalsApi
      .deleteGoalTopic(studyId, key)
      .then(() => {
        const index = goalTopics.value.findIndex((t) => t.key === key);
        if (index > -1) {
          goalTopics.value.splice(index, 1);
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot delete goal topic');
      });
  }

  return {
    goalCategories,
    goalTypes,
    goalTemplates,
    goalConfig,
    goalTopics,
    listGoalTemplates,
    addGoalTemplate,
    updateGoalTemplate,
    deleteGoalTemplate,
    getGoalConfig,
    setGoalConfig,
    createGoalTopic,
    updateGoalTopic,
    deleteGoalTopic,
  };
});
