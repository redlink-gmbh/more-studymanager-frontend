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
  const goalConfig: Ref<StudyGoalConfigData | null> = ref(null);

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
    goalTemplates.value = await goalsApi
      .listGoalTemplates(studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list goal templates');
        return goalTemplates.value;
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
    await goalsApi
      .getGoalConfig(studyId)
      .then((response) => {
        goalConfig.value = response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot get goal configuration');
      });
  }

  async function setGoalConfig(
    studyId: number,
    config: StudyGoalConfig,
  ): Promise<void> {
    await goalsApi
      .setGoalConfig(studyId, config)
      .then((response) => {
        goalConfig.value = response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot update goal configuration');
      });
  }

  // --- Actions für Goal Topics (goals/config/categories/topic) ---
  async function createGoalTopic(
    studyId: number,
    topic: GoalTopic,
  ): Promise<void> {
    await goalsApi
      .createGoalTopic(studyId, topic)
      .then((response) => {
        // Nach dem Hinzufügen Config neu laden oder lokal pushen
        if (goalConfig.value) {
          goalConfig.value.goalTopics.push(response.data);
        }
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
    await goalsApi
      .updateGoalTopic(studyId, key, topic)
      .then((response) => {
        if (goalConfig.value) {
          const index = goalConfig.value.goalTopics.findIndex(
            (t) => t.key === key,
          );
          if (index > -1) {
            goalConfig.value.goalTopics.splice(index, 1, response.data);
          }
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot update goal topic');
      });
  }

  async function deleteGoalTopic(studyId: number, key: string): Promise<void> {
    await goalsApi
      .deleteGoalTopic(studyId, key)
      .then(() => {
        if (goalConfig.value) {
          const index = goalConfig.value.goalTopics.findIndex(
            (t) => t.key === key,
          );
          if (index > -1) {
            goalConfig.value.goalTopics.splice(index, 1);
          }
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
