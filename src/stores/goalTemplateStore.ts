import { ref, Ref, computed } from 'vue';
import { defineStore } from 'pinia';
import {
  GoalTemplate,
  GoalTopic,
  StudyGoalConfig,
  StudyGoalConfigData,
} from '@gs';
import { useGoalsApi } from '../composable/useApi';
import { useErrorHandling } from '../composable/useErrorHandling';
import { useObservationGroupStore } from './observationGroupStore';
import { AxiosError } from 'axios';
import type { GoalTemplateMap } from '../models/GoalTemplateMap';
import { MoreTableChoice } from '../models/MoreTableModel';

export const useGoalTemplateStore = defineStore('goalTemplate', () => {
  const { goalsApi } = useGoalsApi();
  const { handleIndividualError } = useErrorHandling();

  const goalTemplates: Ref<GoalTemplate[]> = ref([]);
  const goalTemplatesMap: Ref<GoalTemplateMap[]> = ref([]);
  const goalConfig: Ref<StudyGoalConfigData | undefined> = ref();
  const goalTopics: Ref<GoalTopic[]> = ref([]);

  const goalTypes = [
   'behavioralGoal',
   'outcomeGoal'
  ];

  // Actions
  async function listGoalTemplates(studyId: number): Promise<void> {
    goalTemplates.value = await goalsApi
      .listGoalTemplates(studyId)
      .then((response) => {
        mapGoalTemplateToGoalTemplateMap(response.data);
        return response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list goal templates');
        return [];
      });
  }

  function mapGoalTemplateToGoalTemplateMap(goalTemplate: GoalTemplate[]): void {
    goalTemplatesMap.value = goalTemplate.map((item) => mapToGoalTemplateMap(item));
  }

  function mapToGoalTemplateMap(goalTemplate: GoalTemplate): GoalTemplateMap {
    const observationGroupStore = useObservationGroupStore();
    return {
      ...goalTemplate,
      categoryKind: goalTemplate?.categories.kind,
      categoryTopics: goalTemplate?.categories.topics,
      goalTypeLabel: `goaltemplate.factory.${goalTemplate.type}.name`,
      appTitle: goalTemplate?.properties?.['app-title'] ?? '',
      adheranceCheckLabels: [],
      hasError: false,
      observationGroupValues:
        goalTemplate.observationGroupIds?.map((id) => {
          const group = observationGroupStore.observationGroups.find(
            (g) => g.observationGroupId === id,
          );
          return {
            label: group?.title || id.toString(),
            value: id.toString(),
          } as MoreTableChoice;
        }) ?? [],
    };
  }

  function checkMissingTopicsError(goalTemplate: GoalTemplate): boolean {
    const missingTopics = goalTemplate.categories.topics.filter(
      (topicKey) => !goalTopics.value.find((t) => t.key === topicKey),
    );

    if (missingTopics.length > 0 || goalTemplate.categories.topics.length === 0) {
      return true
    }
    return false;
  }

  function getTopicNames(keys: string[]): MoreTableChoice[] {
    return keys.map((key) =>
    {
      const item = goalTopics.value.find((t) => t.key === key)

      return {
        label: item?.title as string,
        value: item?.key as string ?? key
      }
    })
    ;
  }

  async function addGoalTemplate(
    studyId: number,
    goalTemplate: GoalTemplate,
  ): Promise<void> {
    await goalsApi
      .addGoalTemplate(studyId, goalTemplate)
      .then((response) => {
        goalTemplates.value.push(response.data);
        goalTemplatesMap.value.push(mapToGoalTemplateMap(response.data));
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot add goal template');
      });
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
        .then((response) => {
            goalTemplates.value.splice(position, 1, response.data);
            goalTemplatesMap.value.splice(position, 1, mapToGoalTemplateMap(response.data));
          }
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
          goalTemplatesMap.value.splice(position, 1);
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
        if ((response.data as any).topics) {
          goalTopics.value = (response.data as any).topics;
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
    await goalsApi
      .setGoalConfig(studyId, config)
      .then((response) => {
        goalConfig.value = response.data;
        if ((response.data as any).topics) {
          goalTopics.value = (response.data as any).topics;
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot update goal configuration');
      });
  }

  async function createGoalTopic(
    studyId: number,
    topic: GoalTopic,
  ): Promise<void> {
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

  const goalCategories = computed(() => {
    return (
      goalTopics.value?.map((topic) => ({
        label: topic.title,
        value: topic.key,
      })) ?? []
    );
  });

  return {
    goalCategories,
    goalTypes,
    checkMissingTopicsError,
    goalTemplates,
    goalTemplatesMap,
    goalConfig,
    goalTopics,
    getTopicNames,
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
