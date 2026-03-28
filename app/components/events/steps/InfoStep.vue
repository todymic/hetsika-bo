<script setup lang="ts">
import { z } from 'zod'
import type { EditorToolbarItem } from '#ui/components/EditorToolbar.vue'
import type { SelectItem } from '#ui/components/Select.vue'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ImageGalleryModal from '~/components/ImageGalleryModal.vue'

const { t }             = useI18n()
const { getCategories } = useCategoryStore()
const store             = useEventFormStore()

const TITLE_MAX = 200

// ── Schema ─────────────────────────────────────────────────
const schema = z.object({
  title:              z.string().min(1, { message: t('events.stepper.info.error.title_required') }),
  selectedCategories: z.array(z.string()).min(1, { message: t('events.stepper.info.error.categories_required') }),
})

// ── State ──────────────────────────────────────────────────
const categoryOptions = ref<SelectItem[]>([])
const titleLength     = computed(() => store.info.title.length)
const titleNearLimit  = computed(() => titleLength.value > TITLE_MAX * 0.8)
const form            = useTemplateRef('form')

// ── Gallery modal ──────────────────────────────────────────
const showGalleryModal = ref(false)
const newCoverFile     = ref<File | null>(null)
const newCoverPreview  = ref<string | null>(null)
const coverRemoved     = ref(false)

const existingCover = computed(() =>
  !coverRemoved.value
    ? store.info.existingFiles?.find((f: any) => f.isCover) ?? store.info.existingFiles?.[0]
    : null
)

const displayCover = computed(() => newCoverPreview.value ?? existingCover.value?.url ?? null)

function removeCover() {
  newCoverFile.value    = null
  newCoverPreview.value = null
  coverRemoved.value    = true
  store.info.files      = []
}

function onCoverChanged(img: any) {
  newCoverFile.value    = null
  newCoverPreview.value = img.url
  coverRemoved.value    = false
  if (store.info.existingFiles) {
    store.info.existingFiles = store.info.existingFiles.map((f: any) => ({
      ...f,
      isCover: f.id === img.id,
    }))
  }
}

function onFilesUploaded(files: File[]) {
  const file = files[0]
  if (!file) return
  newCoverFile.value = file
  store.info.files   = [file]
  const reader = new FileReader()
  reader.onload = (e) => { newCoverPreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
  coverRemoved.value = false
}

// ── Editor ─────────────────────────────────────────────────
const editorExtensions = [
  TaskList,
  TaskItem.configure({ nested: true }),
]

const items: EditorToolbarItem[] = [
  { kind: 'bold',        label: 'bold',   icon: 'i-lucide-bold'         },
  { kind: 'mark',        mark: 'italic',  icon: 'i-lucide-italic'       },
  { kind: 'heading',     level: 1,        icon: 'i-lucide-heading-1'    },
  { kind: 'heading',     level: 2,        icon: 'i-lucide-heading-2'    },
  { kind: 'textAlign',   align: 'left',   icon: 'i-lucide-align-left'   },
  { kind: 'textAlign',   align: 'center', icon: 'i-lucide-align-center' },
  { kind: 'bulletList',                   icon: 'i-lucide-list'         },
  { kind: 'orderedList',                  icon: 'i-lucide-list-ordered' },
  { kind: 'blockquote',                   icon: 'i-lucide-quote'        },
  { kind: 'link',                         icon: 'i-lucide-link'         },
]

// ── Mount ──────────────────────────────────────────────────
onMounted(async () => {
  const categories = await getCategories()
  categoryOptions.value = categories.map(c => ({ label: c.name, value: String(c.id) }))
})

// ── Validation ─────────────────────────────────────────────
async function validate(): Promise<boolean> {
  try { await (form.value as any)?.validate() } catch { return false }
  return schema.safeParse({
    title:              store.info.title,
    selectedCategories: store.info.selectedCategories,
  }).success
}

defineExpose({ validate })
</script>

<template>
  <UCard class="w-full overflow-hidden ">

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
    <UForm ref="form" :schema="schema" :state="store.info" class="space-y-6 ">

      <!-- Title + Categories -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <UFormField
          :label="t('events.stepper.info.title_label')"
          name="title"
          class="sm:col-span-3"
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

        <UFormField
          :label="t('events.stepper.info.categories_label')"
          name="selectedCategories"
          class="sm:col-span-2"
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

      <!-- Description -->
      <UFormField :label="t('events.stepper.info.desc_label')" name="description">
        <div class="overflow-hidden rounded-lg border border-default transition
                    focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
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

      <!-- ── Cover image ────────────────────────────────── -->
      <UFormField
        :label="t('events.stepper.info.upload_label', 'Image de couverture')"
        name="files"
      >
        <template #hint>
          <span class="text-xs text-muted">JPG, PNG, WEBP — max 5 Mo</span>
        </template>

        <!-- Preview -->
        <div v-if="displayCover" class="space-y-3">
          <div class="relative h-44 w-full overflow-hidden rounded-lg bg-muted/30">
            <img
              :src="displayCover"
              alt="Image de couverture"
              class="h-full w-full object-cover"
            />
            <div class="absolute bottom-2 left-2">
              <UBadge color="success" variant="solid" size="xs">
                <UIcon name="i-lucide-star" class="mr-1 size-3" />
                {{ t('events.stepper.info.cover', 'Couverture') }}
              </UBadge>
            </div>
            <div v-if="newCoverFile" class="absolute right-2 top-2">
              <UBadge color="info" variant="solid" size="xs">
                <UIcon name="i-lucide-sparkles" class="mr-1 size-3" />
                {{ t('events.stepper.info.new_file', 'Nouvelle image') }}
              </UBadge>
            </div>
            <UButton
              variant="ghost"
              size="xs"
              icon="i-lucide-trash-2"
              color="error"
              class="absolute right-2 bottom-2"
              @click="removeCover"
            >
              {{ t('common.delete', 'Supprimer') }}
            </UButton>
          </div>

          <UButton
            variant="outline"
            size="sm"
            icon="i-lucide-images"
            class="w-full"
            @click="showGalleryModal = true"
          >
            {{ t('events.stepper.info.upload_replace', 'Gérer les images') }}
          </UButton>
        </div>

        <!-- Drop zone (no cover yet) -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-3 rounded-lg border-2
                 border-dashed p-8 text-center transition-colors duration-200 cursor-pointer
                 border-default hover:border-primary/50 hover:bg-muted/30"
          @click="showGalleryModal = true"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted">
            <UIcon name="i-lucide-images" class="size-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-highlighted">
              {{ t('events.stepper.info.upload_cta', 'Choisir ou téléverser une image') }}
            </p>
            <p class="mt-0.5 text-xs text-muted">
              {{ t('events.stepper.info.upload_or', 'Cliquez pour ouvrir la galerie') }}
            </p>
          </div>
        </div>

      </UFormField>

    </UForm>
  </UCard>

  <!-- ── Gallery Modal ──────────────────────────────────── -->
  <ImageGalleryModal
    v-model="showGalleryModal"
    :initial-images="store.info.existingFiles ?? []"
    @cover-changed="onCoverChanged"
    @files-uploaded="onFilesUploaded"
  />
</template>
