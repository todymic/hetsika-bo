<script setup lang="ts">
import * as z from 'zod'
import type { EditorToolbarItem } from '#ui/components/EditorToolbar.vue'
import type { SelectItem } from '#ui/components/Select.vue'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEventStore } from '~/stores/eventStore'
import ImageGalleryModal from '~/components/ImageGalleryModal.vue'

definePageMeta({ layout: 'event-dashboard' })

const { t }                     = useI18n()
const route                     = useRoute()
const toast                     = useToast()
const { getEvent, updateEvent } = useEventStore()
const { getCategories }         = useCategoryStore()
const eventId                   = Number(route.params.id)

// ── State ──────────────────────────────────────────────────
const pending = ref(true)
const saving  = ref(false)
const form    = useTemplateRef('form')
const event   = ref<any>(null)

const state = ref({
  title:              '',
  description:        '',
  selectedCategories: [] as string[],
})

const original        = ref('')
const categoryOptions = ref<SelectItem[]>([])

// ── Validation ─────────────────────────────────────────────
const TITLE_MAX      = 200
const titleLength    = computed(() => state.value.title.length)
const titleNearLimit = computed(() => titleLength.value > TITLE_MAX * 0.8)

const schema = z.object({
  title:              z.string().min(1, { message: t('events.stepper.info.error.title_required') }),
  selectedCategories: z.array(z.string()).min(1, { message: t('events.stepper.info.error.categories_required') }),
})

// ── Unsaved changes ────────────────────────────────────────
const isDirty = computed(() => JSON.stringify(state.value) !== original.value)
function markSaved()    { original.value = JSON.stringify(state.value) }
function cancelChanges() { state.value = JSON.parse(original.value) }

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm(t('common.unsaved_confirm', 'Vous avez des modifications non enregistrées. Quitter quand même ?'))
})

// ── Gallery modal ──────────────────────────────────────────
const showGalleryModal = ref(false)
const coverRemoved     = ref(false)
const newCoverFile     = ref<File | null>(null)
const newCoverPreview  = ref<string | null>(null)

const existingCover = computed(() =>
  !coverRemoved.value
    ? event.value?.medias?.find((m: any) => m.isCover) ?? event.value?.medias?.[0]
    : null
)

const displayCover = computed(() => newCoverPreview.value ?? existingCover.value?.url ?? null)

function removeCover() {
  newCoverFile.value    = null
  newCoverPreview.value = null
  coverRemoved.value    = true
}

function onCoverChanged(img: any) {
  // L'utilisateur a choisi une image existante comme couverture
  newCoverFile.value    = null
  newCoverPreview.value = img.url
  coverRemoved.value    = false
  // Met à jour la liste des medias pour refléter la nouvelle couverture
  if (event.value?.medias) {
    event.value.medias = event.value.medias.map((m: any) => ({
      ...m,
      isCover: m.id === img.id,
    }))
  }
}

function onFilesUploaded(files: File[]) {
  // Prend le premier fichier uploadé comme couverture candidate
  const file = files[0]
  if (!file) return
  newCoverFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    newCoverPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  coverRemoved.value = false
}

// ── Complétude ─────────────────────────────────────────────
const completenessFields = computed(() => [
  { key: 'title',       filled: !!state.value.title },
  { key: 'categories',  filled: state.value.selectedCategories.length > 0 },
  { key: 'description', filled: state.value.description.length > 20 },
  { key: 'cover',       filled: !!displayCover.value },
])

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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

// ── Mount ──────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [evt, categories] = await Promise.all([
      getEvent(eventId),
      getCategories(),
    ])
    event.value                    = evt
    state.value.title              = evt.title
    state.value.description        = evt.description ?? ''
    state.value.selectedCategories = evt.categories.map((c: any) => String(c.id))
    categoryOptions.value          = categories.map((c: any) => ({ label: c.name, value: String(c.id) }))
    markSaved()
  } finally {
    pending.value = false
  }
})

// ── Save ───────────────────────────────────────────────────
async function save() {
  try { await (form.value as any)?.validate() } catch { return }
  const result = schema.safeParse(state.value)
  if (!result.success) return

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('step', 'INFO')
    formData.append('event', JSON.stringify({
      title:       state.value.title,
      description: state.value.description,
      categoryIds: state.value.selectedCategories.map(Number),
      ...(coverRemoved.value && existingCover.value
        ? { removedFileIds: [existingCover.value.id] }
        : {}),
    }))
    if (newCoverFile.value) {
      formData.append('files[]', newCoverFile.value)
    }

    await updateEvent(eventId, formData)
    markSaved()
    toast.add({ title: t('events.section.info_saved', 'Informations enregistrées'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-5 p-6">

    <!-- ── Page header ────────────────────────────────────── -->
    <EventsDashboardPageHeader
      icon="i-lucide-badge-info"
      :title="t('events.dashboard.menu.info', 'Informations')"
      :description="t('events.stepper.info.subtitle_hint', 'Titre, catégories et description')"
      :is-dirty="isDirty"
      :saving="saving"
      @save="save"
      @cancel="cancelChanges"
    />

    <!-- ── Loading ────────────────────────────────────────── -->
    <div v-if="pending" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>

    <template v-else>

      <!-- ── Complétude ──────────────────────────────────── -->
      <EventsDashboardCompletenessBar :fields="completenessFields" />

      <!-- ── Layout 2 colonnes ───────────────────────────── -->
      <div class="flex flex-col gap-5 lg:grid lg:grid-cols-5">

        <!-- Colonne principale (3/5) -->
        <div class="space-y-5 lg:col-span-3">
          <UCard>
            <UForm ref="form" :schema="schema" :state="state" class="space-y-6 ">

              <!-- Title + Categories -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <UFormField :label="t('events.stepper.info.title_label')" name="title" class="sm:col-span-3">
                  <template #hint>
                    <span
                      :class="titleNearLimit ? 'text-warning' : 'text-muted'"
                      class="text-xs tabular-nums"
                    >
                      {{ titleLength }}/{{ TITLE_MAX }}
                    </span>
                  </template>
                  <UInput
                    v-model="state.title"
                    :placeholder="t('events.stepper.info.title_placeholder', 'Ex : Festival Jazz au Parc')"
                    :maxlength="TITLE_MAX"
                    leading-icon="i-lucide-type"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  :label="t('events.stepper.info.categories_label', 'Catégories')"
                  name="selectedCategories"
                  class="sm:col-span-2"
                >
                  <template #hint>
                    <span v-if="state.selectedCategories.length" class="text-xs text-muted">
                      {{ state.selectedCategories.length }} sélectionnée(s)
                    </span>
                  </template>
                  <USelectMenu
                    v-model="state.selectedCategories"
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
              <UFormField
                :label="t('events.stepper.info.desc_label', 'Description')"
                name="description"
              >
                <div class="overflow-hidden rounded-lg border border-default transition
                            focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <UEditor
                    v-slot="{ editor }"
                    v-model="state.description"
                    :placeholder="t('events.stepper.info.desc_placeholder', 'Décrivez votre événement…')"
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

            </UForm>
          </UCard>
        </div>

        <!-- Colonne latérale (2/5) -->
        <div class="space-y-5 lg:col-span-2">

          <!-- ── Cover image ─────────────────────────────── -->
          <UCard class="overflow-hidden">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-semibold text-highlighted">
                    {{ t('events.stepper.info.upload_label', 'Image de couverture') }}
                  </h2>
                  <p class="mt-0.5 text-xs text-muted">JPG, PNG, WEBP — max 5 Mo</p>
                </div>
                <UButton
                  v-if="displayCover"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash-2"
                  color="error"
                  @click="removeCover"
                >
                  {{ t('common.delete', 'Supprimer') }}
                </UButton>
              </div>
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

            <!-- Drop zone (aucune cover) -->
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
          </UCard>

          <!-- ── Aperçu rapide ────────────────────────────── -->
          <UCard class="p-4">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              {{ t('events.view.quick_preview', 'Aperçu') }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-lg bg-muted/30 p-3">
                <p class="text-xs text-muted">{{ t('events.view.organizer', 'Organisateur') }}</p>
                <p class="mt-0.5 truncate text-xs font-medium text-highlighted">
                  {{ event?.organizer?.name ?? '—' }}
                </p>
              </div>
              <div class="rounded-lg bg-muted/30 p-3">
                <p class="text-xs text-muted">{{ t('events.view.medias', 'Médias') }}</p>
                <p class="mt-0.5 text-xs font-medium text-highlighted">
                  {{ event?.medias?.length ?? 0 }} image(s)
                </p>
              </div>
              <div class="rounded-lg bg-muted/30 p-3">
                <p class="text-xs text-muted">{{ t('events.view.created_at', 'Créé le') }}</p>
                <p class="mt-0.5 text-xs font-medium text-highlighted">
                  {{ event?.createdAt ? formatDate(event.createdAt) : '—' }}
                </p>
              </div>
              <div class="rounded-lg bg-muted/30 p-3">
                <p class="text-xs text-muted">{{ t('events.stepper.info.categories_label', 'Catégories') }}</p>
                <p class="mt-0.5 text-xs font-medium text-highlighted">
                  {{ state.selectedCategories.length }} sélectionnée(s)
                </p>
              </div>
            </div>
          </UCard>

        </div>
      </div>

      <!-- ── Quick links ─────────────────────────────────── -->
      <EventsDashboardQuickLinks
        :event-id="eventId"
        :current="`/events/${eventId}`"
      />

    </template>

    <!-- ── Gallery Modal ──────────────────────────────────── -->
    <ImageGalleryModal
      v-model="showGalleryModal"
      :initial-images="event?.medias ?? []"
      @cover-changed="onCoverChanged"
      @files-uploaded="onFilesUploaded"
    />

  </div>
</template>
