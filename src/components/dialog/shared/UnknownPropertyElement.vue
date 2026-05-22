<script setup lang="ts">
  import { UnknownProperty } from '@/models/InputModels';
  interface Props {
    property: UnknownProperty;
  }

defineProps<Props>();
</script>

<template>
  <div>
    <hr class="mb-4 text-gray-300" />
    <h5 class="mb-2">{{ $t(property.name) }}</h5>
    <p
      v-if="
        property.description && property.description !== 'inputModel.enterValue'
      "
    >
      {{ $t(property.description) }}
    </p>
  </div>

  <div class="mb-4">
    <div class="mb-1 font-bold text-red-500">
      {{ $t('global.error.unknownPropertyType') }}: {{ property.name }} ({{
        property.rawJson.type
      }})
    </div>
    <pre
      class="max-h-40 overflow-auto rounded border bg-gray-100 p-2 text-xs"
      >{{ JSON.stringify(property.rawJson, null, 2) }}</pre
    >
  </div>
</template>
