<script setup lang="ts">
  import { ref, onMounted, watch, ComputedRef, computed } from 'vue';
  import Popover from 'primevue/popover';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import InputText from 'primevue/inputtext';
  import { AdherenceCheckScheduleEnum, StudyGoalConfig } from '@gs';
  import { useGoalConfig, useSetGoalConfig } from '@/api/goalQueries';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  interface Props {
    studyId: number;
    isButtonDisabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isButtonDisabled: false,
  });

  const { data: goalConfig } = useGoalConfig(props.studyId);
  const { mutateAsync: setGoalConfigMutation } = useSetGoalConfig();

  const goalTemplateSchedule: ComputedRef<any[]> = computed(
    () => goalConfig.value?.schedule ?? [],
  );
  const isOpen = ref(false);
  const overlayPanel = ref<InstanceType<typeof Popover> | null>(null);
  const toggleOverlay = (event: MouseEvent): void => {
    overlayPanel.value?.toggle(event);
    isOpen.value = !isOpen.value;
  };

  const timeSlots = ref(
    Object.values(AdherenceCheckScheduleEnum).map((value) => ({
      isActive: false,
      id: value,
      inputValue: '',
    })),
  );

  const initTimeSlots = (): void => {
    const schedule = goalConfig.value?.schedule || [];
    timeSlots.value.forEach((slot) => {
      const existing = schedule.find((s) => s.key === slot.id);
      if (existing) {
        slot.isActive = true;
        slot.inputValue = existing.time || '';
      } else {
        slot.isActive = false;
        slot.inputValue = '';
      }
    });
  };

  onMounted(initTimeSlots);
  watch(() => goalConfig.value, initTimeSlots, { deep: true });

  const handleSave = async (): Promise<void> => {
    const newSchedule = timeSlots.value
      .filter((slot) => slot.isActive && slot.inputValue)
      .map((slot) => ({
        key: slot.id as AdherenceCheckScheduleEnum,
        time: slot.inputValue,
      }));

    const newConfig: StudyGoalConfig = {
      ...goalConfig.value,
      consents: goalConfig.value?.consents || {
        commitment: '',
        achievability: '',
        understandable: '',
      },
      schedule: newSchedule,
    } as StudyGoalConfig;

    await setGoalConfigMutation({ studyId: props.studyId, config: newConfig })
      .then(() => (isOpen.value = false));
    overlayPanel.value?.hide();
    isOpen.value = false;
  };
</script>

<template>
  <div>
    <div
      class="goal-template-meassurment mt-4 mb-1 flex items-center justify-between"
    >
      <h4 class="text-lg font-bold">
        {{ $t('goaltemplate.goalTemplateList.meassurementTimes.title') }}
      </h4>

      <div class="meassurement-dropdown">
        <Button
          type="button"
          class="flex shrink-0 items-center justify-between text-nowrap"
          :disabled="isButtonDisabled"
          @click="toggleOverlay($event)"
        >
          <span>{{
            $t(
              'goaltemplate.goalTemplateList.meassurementTimes.adaptMeassurment',
            )
          }}</span>
          <span
            class="pi pi-angle-down ml-3"
            :class="{ 'rotate-180 transition-all ease-in-out': isOpen }"
          />
        </Button>
        <Popover ref="overlayPanel" :class="['w-[50vw] min-w-lg']">
          <div class="flex flex-col gap-4">
            <div>
              <h4 class="p-text-secondary text-lg font-bold">
                {{
                  $t(
                    'goaltemplate.goalTemplateList.meassurementTimes.meassurements',
                  )
                }}
              </h4>
              <div class="text-sm text-gray-600">
                {{
                  $t(
                    'goaltemplate.goalTemplateList.meassurementTimes.meassurementsDescription',
                  )
                }}
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="item in timeSlots"
                :key="item.id"
                class="grid grid-cols-2 items-center gap-6"
              >
                <div class="flex items-center gap-3">
                  <Checkbox
                    v-model="item.isActive"
                    :binary="true"
                    :input-id="item.id"
                  />
                  <label :for="item.id" class="cursor-pointer">{{
                    $t(
                      `goaltemplate.goalTemplateList.meassurementTimes.times.${item.id}`,
                    )
                  }}</label>
                </div>
                <InputText
                  v-model="item.inputValue"
                  type="time"
                  class="w-full"
                  :disabled="!item.isActive"
                />
              </div>
            </div>
            <div class="mt-2 flex justify-end">
              <Button
                :label="$t('global.labels.save')"
                icon="pi pi-check"
                @click="handleSave"
              />
            </div>
          </div>
        </Popover>
      </div>
    </div>
    <div class="mb-4">
      {{ $t('goaltemplate.goalTemplateList.meassurementTimes.description') }}
    </div>
    <div
      class="mb-6 flex items-center gap-2 rounded border-gray-500 bg-gray-100 px-2"
    >
      <div
        v-if="goalTemplateSchedule.length === 0"
        class="py-2 text-sm text-gray-500 italic"
      >
        {{ $t('goaltemplate.goalTemplateList.meassurementTimes.notSet') }}
      </div>
      <span v-else class="py-2 text-sm"
        >{{ $t('goaltemplate.goalTemplateList.meassurementTimes.set') }}:
        {{
          goalTemplateSchedule
            .map(
              (schedule) =>
                `${t(`goaltemplate.goalTemplateList.meassurementTimes.times.${schedule.key}`)}: ${schedule.time.substring(0, 5)}`,
            )
            .join(', ')
        }}</span
      >
    </div>
  </div>
</template>
