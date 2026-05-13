<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import Popover from 'primevue/popover';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import InputText from 'primevue/inputtext';
  import { AdherenceCheckScheduleEnum, StudyGoalConfig } from '@gs';
  import { useGoalTemplateStore } from '@/stores/goalTemplateStore';

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    isButtonDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const goalTemplateStore = useGoalTemplateStore();
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
    const schedule = goalTemplateStore.goalConfig?.schedule || [];
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
  watch(() => goalTemplateStore.goalConfig, initTimeSlots, { deep: true });

  const handleSave = async (): Promise<void> => {
    const newSchedule = timeSlots.value
      .filter((slot) => slot.isActive && slot.inputValue)
      .map((slot) => ({
        key: slot.id as AdherenceCheckScheduleEnum,
        time: slot.inputValue,
      }));

    const newConfig: StudyGoalConfig = {
      ...goalTemplateStore.goalConfig,
      consents: goalTemplateStore.goalConfig?.consents || {
        commitment: '',
        achievability: '',
        understandable: '',
      },
      schedule: newSchedule,
    };

    await goalTemplateStore.setGoalConfig(props.studyId, newConfig);
    overlayPanel.value?.hide();
    isOpen.value = false;
  };
</script>

<template>
  <div class="meassurement-dropdown">
    <Button
      type="button"
      class="flex shrink-0 items-center justify-between text-nowrap"
      :disabled="isButtonDisabled"
      @click="toggleOverlay($event)"
    >
      <span>{{
        $t('goaltemplate.goalTemplateList.meassurementTimes.adaptMeassurment')
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
                $t(`goaltemplate.goalTemplateList.meassurementTimes.times.${item.id}`)
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
</template>
