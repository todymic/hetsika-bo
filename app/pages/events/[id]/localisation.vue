<script setup lang="ts">
import * as z from 'zod'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                            = useI18n()
const route                            = useRoute()
const toast                            = useToast()
const { getEvent, updateEventAddress } = useEventStore()
const { suggestions, isLoading, search, getDetails } = useGooglePlaces()
const eventId                          = Number(route.params.id)

const pending  = ref(true)
const saving   = ref(false)
const mode     = ref<'autocomplete' | 'manual'>('autocomplete')
const query    = ref('')
const mapCoords = ref<{ lat: number; lng: number } | null>(null)

const state = ref({
  placeId:         '',
  street:          '',
  complement:      '',
  city:            '',
  zipCode:         '',
  selectedCountry: '',
})

const original = ref('')
const isDirty  = computed(() => JSON.stringify(state.value) !== original.value)
function markSaved() { original.value = JSON.stringify(state.value) }
function cancelChanges() { state.value = JSON.parse(original.value) }

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm(t('common.unsaved_confirm', 'Vous avez des modifications non enregistrées. Quitter quand même ?'))
})

const schema = z.object({
  street:          z.string().min(1),
  city:            z.string().min(1),
  zipCode:         z.string().min(1),
  selectedCountry: z.string().min(1),
})

const countries = [
  { label: '🇱🇺  Luxembourg', value: 'LU' },
  { label: '🇫🇷  France',     value: 'FR' },
  { label: '🇧🇪  Belgique',   value: 'BE' },
  { label: '🇩🇪  Allemagne',  value: 'DE' },
  { label: '🇲🇬  Madagascar', value: 'MG' },
]

const formattedAddress = computed(() =>
  [state.value.street, state.value.complement,
    [state.value.zipCode, state.value.city].filter(Boolean).join(' '),
    state.value.selectedCountry].filter(Boolean).join(', ')
)

const completenessFields = computed(() => [
  { key: 'street',  filled: !!state.value.street },
  { key: 'city',    filled: !!state.value.city },
  { key: 'zip',     filled: !!state.value.zipCode },
  { key: 'country', filled: !!state.value.selectedCountry },
  { key: 'map',     filled: !!mapCoords.value },
])

// ── Autocomplete ───────────────────────────────────────────
watch(query, (val) => {
  if (mode.value === 'autocomplete') search(val)
})

const showSuggestions = ref(false)

async function selectPlace(prediction: any) {
  showSuggestions.value = false
  try {
    const details = await getDetails(prediction.place_id)
    state.value.placeId         = prediction.place_id
    state.value.street          = details.street
    state.value.city            = details.city
    state.value.zipCode         = details.zipCode
    state.value.selectedCountry = details.countryCode
    mapCoords.value             = { lat: details.lat, lng: details.lng }
    query.value                 = prediction.description
    suggestions.value           = []
  } catch {
    toast.add({ title: t('common.error', 'Erreur lors de la récupération'), color: 'error' })
  }
}

// ── Mount ──────────────────────────────────────────────────
onMounted(async () => {
  try {
    const event = await getEvent(eventId)
    if (event.address) {
      state.value.street          = event.address.street ?? ''
      state.value.city            = event.address.city ?? ''
      state.value.zipCode         = event.address.zipcode ?? ''
      state.value.selectedCountry = event.address.countryCode ?? ''
    }
    markSaved()
  } finally {
    pending.value = false
  }
})

// ── Save ───────────────────────────────────────────────────
async function save() {
  const result = schema.safeParse(state.value)
  if (!result.success) {
    toast.add({ title: t('common.validation_error', 'Veuillez remplir tous les champs obligatoires'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await updateEventAddress(eventId, {
      placeId:     state.value.placeId || undefined,
      source:      state.value.placeId ? 'google' : 'manual',
      street:      state.value.street,
      city:        state.value.city,
      zipcode:     state.value.zipCode,
      countryCode: state.value.selectedCountry,
    })
    markSaved()
    toast.add({ title: t('events.section.address_saved', 'Adresse enregistrée'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}


// Dans le script
function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

</script>

<template>
  <div class="space-y-5 p-6">

    <EventsDashboardPageHeader
      icon="i-lucide-map-pin"
      :title="t('events.dashboard.menu.localisation', 'Localisation')"
      :description="t('events.stepper.localisation.subtitle_hint', 'Renseignez l\'adresse exacte de l\'évènement')"
      :is-dirty="isDirty"
      :saving="saving"
      @save="save"
      @cancel="cancelChanges"
    />

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <template v-else>
      <EventsDashboardCompletenessBar :fields="completenessFields" />

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">

        <UCard
          class="lg:col-span-3"
          :ui="{
          root: 'overflow-visible',
          body: 'overflow-visible',
        }"
              >

          <!-- Mode toggle -->
          <div class="mb-5 flex rounded-lg bg-muted/30 p-1 gap-1">
            <button
              v-for="m in [
                { key: 'autocomplete', icon: 'i-lucide-search', label: t('events.localisation.mode_auto', 'Recherche automatique') },
                { key: 'manual',       icon: 'i-lucide-pencil', label: t('events.localisation.mode_manual', 'Saisie manuelle') },
              ]"
              :key="m.key"
              class="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm transition-all"
              :class="mode === m.key
                ? 'bg-background font-medium text-highlighted border border-default'
                : 'text-muted hover:text-highlighted'"
              @click="mode = m.key as any"
            >
              <UIcon :name="m.icon" class="size-3.5" />
              {{ m.label }}
            </button>
          </div>

          <!-- ── Autocomplete mode ─────────────────────── -->
          <template v-if="mode === 'autocomplete'">
            <UFormField :label="t('events.localisation.search_label', 'Rechercher une adresse')">
              <div class="relative">
                <!-- Dans le template -->
                <UInput
                  v-model="query"
                  :loading="isLoading"
                  leading-icon="i-lucide-search"
                  :placeholder="t('events.localisation.search_placeholder', 'Ex : Parc Municipal, Luxembourg…')"
                  size="lg"
                  class="w-full"
                  @focus="showSuggestions = true"
                  @blur="hideSuggestions"
                />

                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div
                    v-if="suggestions.length && showSuggestions"
                    class="absolute left-0 right-0 top-full mt-1 overflow-hidden
               rounded-lg border border-default bg-background shadow-xl z-50 bg-white"
                  >
                    <button
                      v-for="s in suggestions"
                      :key="s.place_id"
                      class="flex w-full items-start gap-3 border-b border-default px-3 py-2.5
                 text-left last:border-0 hover:bg-muted/30 transition-colors"
                      @mousedown.prevent="selectPlace(s)"
                    >
                      <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p class="text-sm font-medium text-highlighted">
                          {{ s.structured_formatting?.main_text ?? s.description }}
                        </p>
                        <p class="text-xs text-muted">
                          {{ s.structured_formatting?.secondary_text ?? '' }}
                        </p>
                      </div>
                    </button>
                  </div>
                </Transition>
              </div>
            </UFormField>

            <!-- Autofilled fields -->
            <div
              v-if="state.street"
              class="mt-4 space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
            >
              <p class="flex items-center gap-1.5 text-xs font-medium text-primary">
                <UIcon name="i-lucide-check-circle-2" class="size-3.5" />
                {{ t('events.localisation.autofilled', 'Champs remplis automatiquement') }}
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs text-muted">{{ t('events.stepper.localisation.street_label') }}</p>
                  <p class="text-sm font-medium text-highlighted">{{ state.street }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted">{{ t('events.stepper.localisation.city_label') }}</p>
                  <p class="text-sm font-medium text-highlighted">{{ state.city }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted">{{ t('events.stepper.localisation.zip_label') }}</p>
                  <p class="text-sm font-medium text-highlighted">{{ state.zipCode }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted">{{ t('events.stepper.localisation.country_label') }}</p>
                  <p class="text-sm font-medium text-highlighted">{{ state.selectedCountry }}</p>
                </div>
              </div>
              <UFormField :label="t('events.stepper.localisation.complement_label')" name="complement">
                <template #hint>
                  <span class="text-xs text-muted">{{ t('events.stepper.localisation.complement_hint', 'Optionnel') }}</span>
                </template>
                <UInput
                  v-model="state.complement"
                  :placeholder="t('events.stepper.localisation.complement_placeholder', 'Bâtiment, étage...')"
                  leading-icon="i-lucide-building-2"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div
              v-else
              class="mt-4 flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5"
            >
              <UIcon name="i-lucide-info" class="size-4 shrink-0 text-muted" />
              <p class="text-xs text-muted">
                {{ t('events.localisation.search_hint', 'Recherchez une adresse pour remplir les champs automatiquement.') }}
              </p>
            </div>
          </template>

          <!-- ── Manual mode ────────────────────────────── -->
          <UForm v-else :schema="schema" :state="state" class="space-y-4">
            <UFormField :label="t('events.stepper.localisation.country_label')" name="selectedCountry" required>
              <USelectMenu
                v-model="state.selectedCountry"
                :items="countries"
                value-key="value"
                leading-icon="i-lucide-globe"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('events.stepper.localisation.street_label')" name="street" required>
              <UInput v-model="state.street" leading-icon="i-lucide-map-pin" size="lg" class="w-full" />
            </UFormField>
            <UFormField :label="t('events.stepper.localisation.complement_label')" name="complement">
              <template #hint>
                <span class="text-xs text-muted">{{ t('events.stepper.localisation.complement_hint', 'Optionnel') }}</span>
              </template>
              <UInput v-model="state.complement" leading-icon="i-lucide-building-2" size="lg" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <UFormField :label="t('events.stepper.localisation.zip_label')" name="zipCode" required class="sm:col-span-2">
                <UInput v-model="state.zipCode" leading-icon="i-lucide-hash" size="lg" class="w-full" />
              </UFormField>
              <UFormField :label="t('events.stepper.localisation.city_label')" name="city" required class="sm:col-span-3">
                <UInput v-model="state.city" leading-icon="i-lucide-landmark" size="lg" class="w-full" />
              </UFormField>
            </div>
          </UForm>
        </UCard>

        <!-- ── Carte (2/5) ──────────────────────────────── -->
        <div class="space-y-5 lg:col-span-2">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-highlighted">
                  {{ t('events.localisation.map_title', 'Carte') }}
                </p>
                <UBadge v-if="mapCoords || state.street" color="success" variant="subtle" size="xs">
                  <UIcon name="i-lucide-check-circle-2" class="mr-1 size-3" />
                  Localisé
                </UBadge>
              </div>
            </template>

            <div class="h-52 w-full overflow-hidden rounded-lg bg-muted/30">
              <iframe
                v-if="mapCoords"
                :src="`https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`"
                class="h-full w-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
              <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-center p-4">
                <UIcon name="i-lucide-map" class="size-8 text-muted" />
                <p class="text-xs text-muted">
                  {{ t('events.localisation.map_empty', 'Recherchez une adresse pour afficher la carte') }}
                </p>
              </div>
            </div>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <div
                v-if="formattedAddress"
                class="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5"
              >
                <UIcon name="i-lucide-map-pin-check" class="mt-0.5 size-4 shrink-0 text-primary" />
                <p class="text-xs text-muted">{{ formattedAddress }}</p>
              </div>
            </Transition>
          </UCard>

          <EventsDashboardQuickLinks :event-id="eventId" :current="`/events/${eventId}/localisation`" />
        </div>

      </div>
    </template>
  </div>
</template>
