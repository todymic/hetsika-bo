<script setup lang="ts">
import type { EditorToolbarItem } from '#ui/components/EditorToolbar.vue'
import type { SelectItem } from '#ui/components/Select.vue'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {useFileUpload} from "~/composables/useFileUpload";

const { t }             = useI18n()
const { getCategories } = useCategoryStore()
const store             = useEventFormStore()

const { schema, TITLE_MAX } = useEventInfoForm()
const {
  isDragging, fileError,
  ACCEPTED_TYPES, MAX_SIZE_MB,
  uploadedFiles, existingFiles,
  addFiles, removeFile, removeExistingFile,
  onFileInputChange, onDrop, validateFiles,
} = useFileUpload()

const categoryOptions = ref<SelectItem[]>([])
const titleLength     = computed(() => store.info.title.length)
const titleNearLimit  = computed(() => titleLength.value > TITLE_MAX * 0.8)
const fileInput       = useTemplateRef('fileInput')
const form            = useTemplateRef('form')

const editorExtensions = [
  TaskList,
  TaskItem.configure({ nested: true }),
]

const items: EditorToolbarItem[] = [
  { kind: 'bold',       label: 'bold',   icon: 'i-lucide-bold'         },
  { kind: 'mark',       mark: 'italic',  icon: 'i-lucide-italic'       },
  { kind: 'heading',    level: 1,        icon: 'i-lucide-heading-1'    },
  { kind: 'heading',    level: 2,        icon: 'i-lucide-heading-2'    },
  { kind: 'textAlign',  align: 'left',   icon: 'i-lucide-align-left'   },
  { kind: 'textAlign',  align: 'center', icon: 'i-lucide-align-center' },
  { kind: 'bulletList',                  icon: 'i-lucide-list'         },
  { kind: 'orderedList',                 icon: 'i-lucide-list-ordered' },
  { kind: 'blockquote',                  icon: 'i-lucide-quote'        },
  { kind: 'link',                        icon: 'i-lucide-link'         },
]

onMounted(async () => {
  const categories  = await getCategories()
  categoryOptions.value = categories.map(c => ({ label: c.name, value: c.id }))
})

async function validate(): Promise<boolean> {
  try { await (form.value as any)?.validate() } catch {}
  if (!validateFiles(store.isEditMode)) return false
  return schema.safeParse({
    ...store.info,
    files: store.info.files.length > 0 || store.info.existingFiles.length > 0
      ? [new File([], 'placeholder')]
      : store.info.files,
  }).success
}

defineExpose({ validate })
</script>

<template>
  <UCard class="w-full overflow-hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <template #header>
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg bg-primary/10 text-primary">
          <UIcon name="i-lucide-file-text" class="size-5" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-highlighted">
            {{ t('events.stepper.info.subtitle') }}
          </h1>
          <p class="mt-0.5 text-sm text-muted">
            {{ t('events.stepper.info.subtitle_hint', 'Renseignez les informations générales de votre événement.') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Body ───────────────────────────────────────────── -->
    <UForm ref="form" :schema="schema" :state="store.info" class="space-y-6">

      <!-- Title + Categories -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <UFormField :label="t('events.stepper.info.title_label')" name="title" class="sm:col-span-3">
          <template #hint>
            <span :class="titleNearLimit ? 'text-warning' : 'text-muted'" class="text-xs tabular-nums">
              {{ titleLength }}/{{ TITLE_MAX }}
            </span>
          </template>
          <UInput
            v-model="store.info.title"
            :placeholder="t('events.stepper.info.title_placeholder')"
            :maxlength="TITLE_MAX"
            leading-icon="i-lucide-type"
            size="lg" class="w-full"
          />
        </UFormField>

        <UFormField :label="t('events.stepper.info.categories_label')" name="selectedCategories" class="sm:col-span-2">
          <template #hint>
            <span v-if="store.info.selectedCategories.length" class="text-xs text-muted">
              {{ store.info.selectedCategories.length }} sélectionnée(s)
            </span>
          </template>
          <USelectMenu
            v-model="store.info.selectedCategories"
            :items="categoryOptions"
            :placeholder="t('events.stepper.info.categories_placeholder')"
            leading-icon="i-lucide-tag"
            value-key="value"
            size="lg" multiple class="w-full"
          />
        </UFormField>
      </div>

      <!-- Description -->
      <UFormField :label="t('events.stepper.info.desc_label')" name="description">
        <div class="overflow-hidden rounded-lg border border-default
                    focus-within:border-primary focus-within:ring-2
                    focus-within:ring-primary/20 transition">
          <UEditor
            v-slot="{ editor }"
            v-model="store.info.description"
            :placeholder="t('events.stepper.info.desc_placeholder')"
            :extensions="editorExtensions"
            content-type="markdown"
            class="w-full min-h-48"
          >
            <UEditorToolbar :editor="editor" :items="items" size="md"
                            class="w-full border-b border-default bg-muted/40 px-1" />
          </UEditor>
        </div>
      </UFormField>

      <!-- File upload -->
      <UFormField :label="t('events.stepper.info.upload_label', 'Pièce jointe')" name="files">
        <template #hint>
          <span class="text-xs text-muted">JPG, PNG, WEBP — max {{ MAX_SIZE_MB }} Mo</span>
        </template>

        <!-- Existing files (edit mode) -->
        <EventsStepsPartialsInfoStepExistingFiles
          :files="existingFiles"
          @remove="removeExistingFile"
        />

        <!-- Drop zone + uploaded file -->
        <EventsStepsPartialsInfoStepDropZone
          :is-dragging="isDragging"
          :accepted-types="ACCEPTED_TYPES"
          :max-size-mb="MAX_SIZE_MB"
          :uploaded-files="uploadedFiles"
          :file-error="fileError"
          @click="fileInput?.click()"
          @dragover="isDragging = true"
          @dragleave="isDragging = false"
          @drop="onDrop"
          @remove-file="removeFile"
          @input-change="onFileInputChange"
        >
          <template #input>
            <input
              ref="fileInput"
              type="file"
              :accept="ACCEPTED_TYPES.join(',')"
              class="hidden"
              @change="onFileInputChange"
            />
          </template>
        </EventsStepsPartialsInfoStepDropZone>

      </UFormField>
    </UForm>
  </UCard>
</template>
