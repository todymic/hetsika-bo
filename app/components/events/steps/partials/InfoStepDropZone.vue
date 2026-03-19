<script setup lang="ts">
defineProps<{
  isDragging:    boolean
  acceptedTypes: string[]
  maxSizeMb:     number
  uploadedFiles: { id: string; file: File; preview: string | null; error: string | null }[]
  fileError:     string
}>()

const emit = defineEmits<{
  drop:         [e: DragEvent]
  dragover:     []
  dragleave:    []
  click:        []
  removeFile:   [id: string]
  inputChange:  [e: Event]
}>()

const { t } = useI18n()

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} Ko`
    : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
</script>

<template>
  <!-- Drop zone -->
  <div
    class="relative flex flex-col items-center justify-center gap-3 rounded-lg
           border-2 border-dashed p-8 text-center transition-colors duration-200 cursor-pointer"
    :class="isDragging
      ? 'border-primary bg-primary/5'
      : 'border-default hover:border-primary/50 hover:bg-muted/30'"
    @click="$emit('click')"
    @dragover.prevent="$emit('dragover')"
    @dragleave.prevent="$emit('dragleave')"
    @drop.prevent="$emit('drop', $event)"
  >
    <slot name="input" />

    <div
      class="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-colors"
      :class="isDragging ? 'bg-primary/10 text-primary' : 'text-muted'"
    >
      <UIcon name="i-lucide-upload-cloud" class="size-5" />
    </div>
    <div>
      <p class="text-sm font-medium text-highlighted">
        {{ t('events.stepper.info.upload_cta', 'Glissez votre fichier ici') }}
      </p>
      <p class="mt-0.5 text-xs text-muted">
        {{ t('events.stepper.info.upload_or', 'ou cliquez pour parcourir') }}
      </p>
    </div>
  </div>

  <!-- File error -->
  <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0">
    <p v-if="fileError" class="mt-2 flex items-center gap-1.5 text-xs text-error">
      <UIcon name="i-lucide-alert-circle" class="size-3.5" />
      {{ fileError }}
    </p>
  </Transition>

  <!-- Uploaded file list -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
  >
    <ul v-if="uploadedFiles.length" class="mt-3 space-y-2">
      <li
        v-for="f in uploadedFiles"
        :key="f.id"
        class="flex items-center gap-3 rounded-lg border px-3 py-2"
        :class="f.error ? 'border-error/30 bg-error/5' : 'border-default bg-muted/20'"
      >
        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-default bg-muted/40">
          <img v-if="f.preview" :src="f.preview" class="h-full w-full object-cover" :alt="f.file.name" />
          <div v-else class="flex h-full w-full items-center justify-center">
            <UIcon
              :name="f.error ? 'i-lucide-alert-circle' : 'i-lucide-file-text'"
              class="size-4"
              :class="f.error ? 'text-error' : 'text-muted'"
            />
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">{{ f.file.name }}</p>
          <p class="text-xs" :class="f.error ? 'text-error' : 'text-muted'">
            {{ f.error ?? formatSize(f.file.size) }}
          </p>
        </div>
        <UButton variant="ghost" size="xs" icon="i-lucide-x" color="neutral" @click.stop="$emit('removeFile', f.id)" />
      </li>
    </ul>
  </Transition>
</template>
