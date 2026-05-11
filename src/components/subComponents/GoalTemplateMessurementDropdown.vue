<script setup lang="ts">
  import { ref } from 'vue';
  import Popover from 'primevue/popover';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import InputText from 'primevue/inputtext';

defineProps({
    isButtonDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const overlayPanel = ref<InstanceType<typeof Popover> | null>(null);
  const toggleOverlay = (event: MouseEvent): void => {
    overlayPanel.value?.toggle(event);
    isOpen.value = !isOpen.value;
  };
  const isOpen = ref(false);

  const timeSlots = ref([
    {
      isActive: false,
      id: 'morning',
      inputValue: '',
    },
    {
      isActive: false,
      id: 'noon',
      inputValue: '',
    },
    {
      isActive: false,
      id: 'evening',
      inputValue: '',
    },
  ]);
</script>

<template>
  <div class="meassurement-dropdownh">
    <Button
      type="button"
      class="flex w-full items-center justify-between text-nowrap"
      :disabled="isButtonDisabled"
      @click="toggleOverlay($event)"
    >
      <span>{{
        $t('goal.goalTemplateList.meassurementTimes.adaptMeassurment')
      }}</span>
      <span
        class="pi pi-angle-down ml-3"
        :class="{ 'rotate-180 transition-all ease-in-out': isOpen }"
      />
    </Button>
    <Popover ref="overlayPanel" :class="['w-[50vw] min-w-lg']">
      <div>
        <h4 class="font-bold">
          {{ $t('goal.goalTemplateList.meassurementTimes.meassurements') }}
        </h4>
        <div>
          {{
            $t(
              'goal.goalTemplateList.meassurementTimes.meassurementsDescription',
            )
          }}
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in timeSlots"
          :key="index"
          class="grid grid-cols-2 items-center gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Checkbox
                v-model="item.isActive"
                :binary="true"
                :input-id="item.id"
              />
              <label :for="item.id">{{
                $t(`goal.goalTemplateList.meassurementTimes.times.${item.id}`)
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
      </div>
    </Popover>
  </div>
</template>
