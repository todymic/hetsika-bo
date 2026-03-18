<script setup lang="ts">
import * as z from 'zod'
import type { EditorToolbarItem } from '#ui/components/EditorToolbar.vue'
import type { SelectItem } from '#ui/components/Select.vue'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

const { t }             = useI18n()
const { getCategories } = useCategoryStore()
const store             = useEventFormStore()

const TITLE_MAX = 200

const schema = z.object({
  title:             z.string().min(1, { message: t('events.stepper.info.error.title_required') }),
  selectedCategories: z.array(z.number()).min(1, { message: t('events.stepper.info.error.categories_required') }),
  files:              z.array(z.instanceof(File)).min(1, { message: t('events.stepper.info.error.upload_required') }),
})

const categoryOptions = ref<SelectItem[]>([])

const titleLength    = computed(() => store.info.title.length)
const titleNearLimit = computed(() => titleLength.value > TITLE_MAX * 0.8)

// ── Editor ─────────────────────────────────────────────────
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

// ── File upload ────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB    = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const isDragging    = ref(false)
const fileInput     = useTemplateRef('fileInput')

function isImage(file: File) { return file.type.startsWith('image/') }

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type))
    return t('events.stepper.info.upload_error_type', 'Type non supporté')
  if (file.size > MAX_SIZE_BYTES)
    return t('events.stepper.info.upload_error_size', `Max ${MAX_SIZE_MB} Mo`)
  return null
}

const uploadedFiles = computed(() => store.info.uploadedFiles)

function addFiles(files: FileList | File[]) {
  for (const file of Array.from(files)) {
    const error   = validateFile(file)
    const preview = isImage(file) && !error ? URL.createObjectURL(file) : null
    store.info.uploadedFiles.push({ id: crypto.randomUUID(), file, preview, error })
    if (!error) {
      store.info.files.push(file)
      fileError.value = ''
    }
  }
}

function removeFile(id: string) {
  const f = store.info.uploadedFiles.find(f => f.id === id)
  if (f?.preview) URL.revokeObjectURL(f.preview)
  store.info.uploadedFiles = store.info.uploadedFiles.filter(f => f.id !== id)
  store.info.files = store.info.uploadedFiles
    .filter(f => !f.error)
    .map(f => f.file)
}

function onFileInputChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} Ko`
    : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

onUnmounted(() => {
  //uploadedFiles.value.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
})

onMounted(async () => {
  const categories  = await getCategories()
  categoryOptions.value = categories.map(c => ({ label: c.name, value: c.id }))
})

const form = useTemplateRef('form')
const fileError = ref<string>('')
async function validate(): Promise<boolean> {
  try { await (form.value as any)?.validate() }
  catch(e: any) {
    console.log(e.errors)
  }

  if (store.info.files.length === 0) {
    fileError.value = t('events.stepper.info.error.upload_required')
    console.log(fileError.value)
    return false
  }
  fileError.value = ''

  return schema.safeParse(store.info).success
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

      <!-- Row 1 : Title + Categories -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">

        <!-- Title (3/5) -->
        <UFormField
          :label="t('events.stepper.info.title_label')"
          name="title"
          class="sm:col-span-3"
          required
        >
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
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Categories (2/5) -->
        <UFormField
          :label="t('events.stepper.info.categories_label')"
          name="selectedCategories"
          class="sm:col-span-2"
          required
        >
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
            size="lg"
            multiple
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Row 2 : Description -->
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
            <UEditorToolbar
              :editor="editor"
              :items="items"
              size="md"
              class="w-full border-b border-default bg-muted/40 px-1"
            />
          </UEditor>
        </div>
      </UFormField>

      <!-- Row 3 : File upload -->
      <UFormField
        :label="t('events.stepper.info.upload_label')"
        name="files"
        required
      >
        <template #hint>
          <span class="text-xs text-muted">
            JPG, PNG, WEBP — max {{ MAX_SIZE_MB }} Mo
          </span>
        </template>

        <!-- Drop zone -->
        <div
          class="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2
                 border-dashed p-8 text-center transition-colors duration-200 cursor-pointer"
          :class="isDragging
            ? 'border-primary bg-primary/5'
            : 'border-default hover:border-primary/50 hover:bg-muted/30'"
          @click="fileInput?.click()"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            :accept="ACCEPTED_TYPES.join(',')"
            class="hidden"
            @change="onFileInputChange"
          />
          <div class="flex h-10 w-10 items-center justify-center rounded-full
                      bg-muted/50 transition-colors"
               :class="isDragging ? 'bg-primary/10 text-primary' : 'text-muted'">
            <UIcon name="i-lucide-upload-cloud" class="size-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-highlighted">
              {{ t('events.stepper.info.upload_cta') }}
            </p>
            <p class="mt-0.5 text-xs text-muted">
              {{ t('events.stepper.info.upload_or') }}
            </p>
          </div>
        </div>

        <!-- File list -->
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
              <UButton variant="ghost" size="xs" icon="i-lucide-x" color="neutral" @click.stop="removeFile(f.id)" />
            </li>
          </ul>
        </Transition>
      </UFormField>

    </UForm>
  </UCard>
</template>
