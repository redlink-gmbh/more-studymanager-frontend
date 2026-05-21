import { useMutation, useQuery, useQueryClient, UseQueryReturnType, UseMutationReturnType } from '@tanstack/vue-query';
import { useGoalsApi } from '../composable/useApi';
import { MaybeRefOrGetter, toValue } from 'vue';
import {
  GoalTemplate,
  GoalTopic,
  StudyGoalConfig,
  StudyGoalConfigData,
} from '@gs';
import type { GoalTemplateMap } from '../models/GoalTemplateMap';
import { MoreTableChoice } from '../models/MoreTableModel';

export const useGoalTemplates = (
  studyId: MaybeRefOrGetter<number>,
): UseQueryReturnType<GoalTemplate[], Error> => {
  const { goalsApi } = useGoalsApi();

  return useQuery({
    queryKey: ['studies', studyId, 'goal-templates'],
    queryFn: () =>
      goalsApi
        .listGoalTemplates(toValue(studyId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId),
  });
};

export const useGoalConfig = (
  studyId: MaybeRefOrGetter<number>,
): UseQueryReturnType<StudyGoalConfigData, Error> => {
  const { goalsApi } = useGoalsApi();

  return useQuery({
    queryKey: ['studies', studyId, 'goal-config'],
    queryFn: () =>
      goalsApi
        .getGoalConfig(toValue(studyId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId),
  });
};

export const useAddGoalTemplate = (): UseMutationReturnType<
  GoalTemplate,
  Error,
  { studyId: number; goalTemplate: GoalTemplate },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, goalTemplate }) =>
      goalsApi
        .addGoalTemplate(studyId, goalTemplate)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useUpdateGoalTemplate = (): UseMutationReturnType<
  GoalTemplate,
  Error,
  { studyId: number; templateId: number; goalTemplate: GoalTemplate },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, templateId, goalTemplate }) =>
      goalsApi
        .updateGoalTemplate(studyId, templateId, goalTemplate)
        .then((res) => res.data),
    onSuccess: (updatedTemplate, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useDeleteGoalTemplate = (): UseMutationReturnType<
  void,
  Error,
  { studyId: number; templateId: number },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, templateId }) =>
      goalsApi
        .deleteGoalTemplate(studyId, templateId)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useSetGoalConfig = (): UseMutationReturnType<
  StudyGoalConfigData,
  Error,
  { studyId: number; config: StudyGoalConfig },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, config }) =>
      goalsApi
        .setGoalConfig(studyId, config)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-config'],
      });
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useCreateGoalTopic = (): UseMutationReturnType<
  GoalTopic,
  Error,
  { studyId: number; topic: GoalTopic },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, topic }) =>
      goalsApi
        .createGoalTopic(studyId, topic)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-config'],
      });
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useUpdateGoalTopic = (): UseMutationReturnType<
  GoalTopic,
  Error,
  { studyId: number; key: string; topic: GoalTopic },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, key, topic }) =>
      goalsApi
        .updateGoalTopic(studyId, key, topic)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-config'],
      });
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

export const useDeleteGoalTopic = (): UseMutationReturnType<
  void,
  Error,
  { studyId: number; key: string },
  unknown
> => {
  const { goalsApi } = useGoalsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, key }) =>
      goalsApi
        .deleteGoalTopic(studyId, key)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-config'],
      });
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'goal-templates'],
      });
    },
  });
};

// --- MAPPING UTILS ---

export function mapToGoalTemplateMap(
  goalTemplate: GoalTemplate,
  observationGroups: any[],
): GoalTemplateMap {
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
        const group = observationGroups.find(
          (g) => g.observationGroupId === id,
        );
        return {
          label: group?.title || id.toString(),
          value: id.toString(),
        } as MoreTableChoice;
      }) ?? [],
  };
}

export function checkMissingTopicsError(
  goalTemplate: GoalTemplate,
  goalTopics: GoalTopic[],
): boolean {
  const missingTopics = goalTemplate.categories.topics.filter(
    (topicKey) => !goalTopics.find((t) => t.key === topicKey),
  );

  return missingTopics.length > 0 || goalTemplate.categories.topics.length === 0;
}

export function getTopicNames(
  keys: string[],
  goalTopics: GoalTopic[],
): MoreTableChoice[] {
  return keys.map((key) => {
    const item = goalTopics.find((t) => t.key === key);

    return {
      label: item?.title as string,
      value: (item?.key as string) ?? key,
    };
  });
}
