/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import {
    InfoMessage,
    MESSAGE_MAX_LENGTH,
    MESSAGE_PRIORITIES,
    MessagesProperty,
  } from '@/models/InputModels';
  import { PropType, ref, watch } from 'vue';
  import Textarea from 'primevue/textarea';
  import Select from 'primevue/select';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import FileUpload, { FileUploadUploaderEvent } from 'primevue/fileupload';
  import { useI18n } from 'vue-i18n';
  import { ObservationAttachment } from '@gs';
  import { Context } from '@/models/ContextModel';
  import { useObservationsApi } from '@/composable/useApi';
  import { useToastService } from '@/composable/toastService';
  import { prepareAttachment } from '@/utils/fileUtils';

  const { t, d } = useI18n();
  const { observationsApi } = useObservationsApi();
  const { showErrorToast } = useToastService();

  const props = defineProps({
    property: {
      type: Object as PropType<MessagesProperty>,
      required: true,
    },
    context: {
      type: Object as PropType<Context>,
      required: true,
    },
    // new messages can be added (also while the study is active)
    editable: {
      type: Boolean,
      default: false,
    },
    // messages stored before opening the dialog can be changed (draft/paused only)
    canEditExisting: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', messagesProperty: MessagesProperty): void;
  }>();

  if (!props.property.value) {
    props.property.value = [];
  }
  const existingIds = new Set(props.property.value.map((m) => m.id));
  const isEditable = (message: InfoMessage): boolean =>
    existingIds.has(message.id) ? props.canEditExisting : props.editable;

  const priorityOptions = MESSAGE_PRIORITIES.map((p) => ({
    label: t(`observation.factory.info.form.priorities.${p}`),
    value: p,
  }));

  const attachmentInfo = ref<Record<string, ObservationAttachment>>({});
  if (props.context.observationId) {
    observationsApi
      .listObservationAttachments(
        props.context.studyId,
        props.context.observationId,
      )
      .then((response) => {
        attachmentInfo.value = Object.fromEntries(
          response.data.map((a) => [a.attachmentId, a]),
        );
      })
      .catch((e) => console.error('cannot list attachments', e));
  }

  watch(
    () => props.property.value,
    () => emit('onInputChange', props.property),
    { deep: true },
  );

  function addMessage(): void {
    props.property.value?.push({
      id: crypto.randomUUID(),
      text: '',
      priority: 'NORMAL',
      attachments: [],
    });
  }

  function removeMessage(id: string): void {
    props.property.value = props.property.value?.filter((m) => m.id !== id);
    delete props.property.pendingFiles[id];
  }

  async function addFiles(
    messageId: string,
    event: FileUploadUploaderEvent,
  ): Promise<void> {
    const files = Array.isArray(event.files) ? event.files : [event.files];
    for (const file of files) {
      try {
        const prepared = await prepareAttachment(file);
        props.property.pendingFiles[messageId] = [
          ...(props.property.pendingFiles[messageId] ?? []),
          prepared,
        ];
      } catch {
        showErrorToast(
          t('observation.factory.info.form.fileTooLarge', { name: file.name }),
        );
      }
    }
  }

  function removeFile(messageId: string, index: number): void {
    props.property.pendingFiles[messageId]?.splice(index, 1);
  }

  const preview = ref<{ url: string; name: string; type: string }>();

  function showPreview(blob: Blob, name: string, type: string): void {
    // the backend serves octet-stream, so the real type is needed to render pdfs inline
    const url = URL.createObjectURL(new Blob([blob], { type }));
    preview.value = { url, name, type };
  }

  async function previewAttachment(attachmentId: string): Promise<void> {
    if (!props.context.observationId) return;
    try {
      const response = await observationsApi.getObservationAttachment(
        props.context.studyId,
        props.context.observationId,
        attachmentId,
        { responseType: 'blob' },
      );
      const info = attachmentInfo.value[attachmentId];
      showPreview(
        response.data as Blob,
        info?.filename ?? attachmentId,
        info?.contentType ?? '',
      );
    } catch {
      showErrorToast(t('observation.factory.info.form.downloadFailed'));
    }
  }

  function downloadPreview(): void {
    if (!preview.value) return;
    const link = document.createElement('a');
    link.href = preview.value.url;
    link.download = preview.value.name;
    link.click();
  }

  function closePreview(): void {
    if (preview.value) URL.revokeObjectURL(preview.value.url);
    preview.value = undefined;
  }

  const isTextInvalid = (message: InfoMessage): boolean =>
    !message.text?.trim() || message.text.length > MESSAGE_MAX_LENGTH;
</script>

<template>
  <div class="flex flex-col gap-2">
    <h6 class="font-bold">
      <label>{{ $t(property.name) }}</label>
    </h6>
    <div>{{ $t(property.description) }}</div>

    <div v-if="!property.value?.length" class="text-gray-500 italic">
      {{ $t('observation.factory.info.form.noMessages') }}
    </div>

    <div
      v-for="(message, index) in property.value"
      :key="message.id"
      class="flex flex-col gap-2 rounded border border-gray-200 p-3"
    >
      <div class="flex flex-wrap items-center gap-3">
        <span class="font-bold">
          {{
            $t('observation.factory.info.form.message', { index: index + 1 })
          }}
        </span>
        <span v-if="message.sentAt" class="text-sm text-gray-500">
          {{
            $t('observation.factory.info.form.sentAt', {
              date: d(new Date(message.sentAt), 'long'),
            })
          }}
        </span>
        <span v-if="message.publishAt" class="text-sm text-gray-500">
          {{
            $t('observation.factory.info.form.publishAt', {
              date: d(new Date(message.publishAt), 'long'),
            })
          }}
        </span>
        <Button
          v-if="!existingIds.has(message.id)"
          class="ml-auto"
          icon="pi pi-trash"
          severity="secondary"
          text
          :aria-label="$t('observation.factory.info.form.removeMessage')"
          @click="removeMessage(message.id)"
        />
      </div>

      <template v-if="isEditable(message)">
        <label :for="`${message.id}-text`">
          {{ $t('observation.factory.info.form.text') }}*
        </label>
        <Textarea
          :id="`${message.id}-text`"
          v-model="message.text"
          class="w-full"
          rows="4"
          auto-resize
          :maxlength="MESSAGE_MAX_LENGTH"
          :invalid="isTextInvalid(message)"
        />
        <small v-if="isTextInvalid(message)" class="text-sm text-red-600">
          {{ $t('observation.factory.info.form.textRequired') }}
        </small>
        <label :for="`${message.id}-priority`">
          {{ $t('observation.factory.info.form.priority') }}
        </label>
        <Select
          v-model="message.priority"
          :input-id="`${message.id}-priority`"
          :options="priorityOptions"
          option-label="label"
          option-value="value"
          class="w-full md:w-56"
        />
      </template>
      <template v-else>
        <p class="whitespace-pre-wrap">{{ message.text }}</p>
        <span v-if="message.priority" class="text-sm">
          {{ $t('observation.factory.info.form.priority') }}:
          {{
            $t(`observation.factory.info.form.priorities.${message.priority}`)
          }}
        </span>
      </template>

      <div class="flex flex-col gap-1">
        <span class="text-sm font-bold">
          {{ $t('observation.factory.info.form.attachments') }}
        </span>
        <ul class="flex flex-col gap-1">
          <li v-for="attachmentId in message.attachments" :key="attachmentId">
            <a
              href="#"
              class="text-primary-600 underline"
              @click.prevent="previewAttachment(attachmentId)"
            >
              <span class="pi pi-paperclip mr-1" />
              {{ attachmentInfo[attachmentId]?.filename ?? attachmentId }}
            </a>
          </li>
          <li
            v-for="(file, fileIndex) in property.pendingFiles[message.id]"
            :key="`${file.name}-${fileIndex}`"
            class="flex items-center gap-2"
          >
            <a
              href="#"
              class="text-primary-600 underline"
              @click.prevent="showPreview(file, file.name, file.type)"
            >
              <span class="pi pi-file mr-1" />
              {{ file.name }}
            </a>
            <span class="text-sm text-gray-500 italic">
              ({{ $t('observation.factory.info.form.pendingUpload') }})
            </span>
            <Button
              icon="pi pi-times"
              severity="secondary"
              text
              size="small"
              :aria-label="$t('global.labels.delete')"
              @click="removeFile(message.id, fileIndex)"
            />
          </li>
        </ul>
        <FileUpload
          v-if="isEditable(message)"
          mode="basic"
          :multiple="true"
          :custom-upload="true"
          :auto="true"
          upload-icon="pi pi-paperclip"
          :choose-label="$t('observation.factory.info.form.addAttachments')"
          @uploader="addFiles(message.id, $event)"
        />
      </div>
    </div>

    <div v-if="editable">
      <Button
        icon="pi pi-plus"
        :label="$t('observation.factory.info.form.addMessage')"
        @click="addMessage()"
      />
    </div>

    <Dialog
      :visible="!!preview"
      :header="preview?.name"
      modal
      :draggable="false"
      :style="{ width: '60vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      @update:visible="closePreview()"
    >
      <template v-if="preview">
        <img
          v-if="preview.type.startsWith('image/')"
          :src="preview.url"
          :alt="preview.name"
          class="mx-auto max-h-[70vh] max-w-full"
        />
        <iframe
          v-else-if="preview.type === 'application/pdf'"
          :src="preview.url"
          :title="preview.name"
          class="h-[70vh] w-full"
        />
        <p v-else class="text-gray-500 italic">
          {{ $t('observation.factory.info.form.noPreview') }}
        </p>
      </template>
      <template #footer>
        <Button
          icon="pi pi-download"
          :label="$t('observation.factory.info.form.download')"
          @click="downloadPreview()"
        />
      </template>
    </Dialog>
  </div>
</template>
