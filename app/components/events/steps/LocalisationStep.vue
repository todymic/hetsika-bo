<script setup lang="ts">
import * as z from 'zod'

const { t }    = useI18n()
const store    = useEventFormStore()
const toast    = useToast()
const { suggestions, isLoading, search, getDetails } = useGooglePlaces()

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

const mode            = ref<'autocomplete' | 'manual'>('autocomplete')
const query           = ref('')
const showSuggestions = ref(false)

// ── Carte ──────────────────────────────────────────────────
const mapSrc = computed(() => {
  // Mode autocomplete : coordonnées GPS
  if (store.address.lat && store.address.lng) {
    return `https://www.google.com/maps?q=${store.address.lat},${store.address.lng}&z=15&output=embed`
  }
  // Mode manuel : recherche texte
  const parts = [
    store.address.street,
    store.address.zipCode,
    store.address.city,
    store.address.selectedCountry,
  ].filter(Boolean)

  if (parts.length < 2) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(parts.join(', '))}&output=embed`
})

// ── Adresse formatée ───────────────────────────────────────
const formattedAddress = computed(() => {
  const { street, complement, city, zipCode, selectedCountry } = store.address
  return [street, complement, [zipCode, city].filter(Boolean).join(' '), selectedCountry]
    .filter(Boolean).join(', ')
})

// ── Complétude ─────────────────────────────────────────────
const completenessFields = computed(() => [
  { key: 'name',    filled: !!store.address.placeName },
  { key: 'street',  filled: !!store.address.street },
  { key: 'city',    filled: !!store.address.city },
  { key: 'zip',     filled: !!store.address.zipCode },
  { key: 'country', filled: !!store.address.selectedCountry },
  { key: 'map',     filled: !!mapSrc.value },
])

// ── Autocomplete ───────────────────────────────────────────
watch(query, (val) => {
  if (mode.value === 'autocomplete') search(val)
})

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

async function selectPlace(prediction: any) {
  showSuggestions.value = false
  try {
    const details = await getDetails(prediction.place_id)
    store.address.placeId         = details.placeId
    store.address.placeName       = details.placeName
    store.address.street          = details.street
    store.address.city            = details.city
    store.address.zipCode         = details.zipCode
    store.address.selectedCountry = details.countryCode
    store.address.lat             = details.lat
    store.address.lng             = details.lng
    query.value                   = prediction.description
    suggestions.value             = []
  } catch {
    toast.add({ title: t('common.error', 'Erreur lors de la récupération'), color: 'error' })
  }
}

// ── Validation ─────────────────────────────────────────────
const form = useTemplateRef('addressForm')

async function validate(): Promise<boolean> {
  try { await (form.value as any)?.validate() } catch { /**/ }
  return schema.safeParse(store.address).success
}

defineExpose({ validate })
</script>

<template>
  <UCard
    class="w-full overflow-hidden"
    :ui="{ root: 'overflow-visible', body: 'overflow-visible' }"
  >

    <!-- ── Header ─────────────────────────────────────────── -->
    <template #header>
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg bg-primary/10 text-primary">
          <UIcon name="i-lucide-map-pin" class="size-5" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-highlighted">
            {{ t('events.stepper.localisation.subtitle') }}
          </h1>
          <p class="mt-0.5 text-sm text-muted">
            {{ t('events.stepper.localisation.subtitle_hint') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Body ───────────────────────────────────────────── -->
    <div class="space-y-5">

      <!-- Mode toggle -->
      <div class="flex rounded-lg bg-muted/30 p-1 gap-1">
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

      <!-- ── Autocomplete mode ──────────────────────────── -->
      <template v-if="mode === 'autocomplete'">
        <UFormField :label="t('events.localisation.search_label', 'Rechercher une adresse')">
          <div class="relative">
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
                       rounded-lg border border-default bg-background shadow-xl z-50 bg-default"
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

        <div
          v-if="store.address.street"
          class="space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
        >
          <p class="flex items-center gap-1.5 text-xs font-medium text-primary">
            <UIcon name="i-lucide-check-circle-2" class="size-3.5" />
            {{ t('events.localisation.autofilled', 'Champs remplis automatiquement') }}
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <p class="text-xs text-muted">{{ t('events.stepper.localisation.place_name') }}</p>
              <p class="text-sm font-medium text-highlighted">{{ store.address.placeName }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-muted">{{ t('events.stepper.localisation.street_label') }}</p>
              <p class="text-sm font-medium text-highlighted">{{ store.address.street }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('events.stepper.localisation.city_label') }}</p>
              <p class="text-sm font-medium text-highlighted">{{ store.address.city }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('events.stepper.localisation.zip_label') }}</p>
              <p class="text-sm font-medium text-highlighted">{{ store.address.zipCode }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('events.stepper.localisation.country_label') }}</p>
              <p class="text-sm font-medium text-highlighted">{{ store.address.selectedCountry }}</p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5"
        >
          <UIcon name="i-lucide-info" class="size-4 shrink-0 text-muted" />
          <p class="text-xs text-muted">
            {{ t('events.localisation.search_hint', 'Recherchez une adresse pour remplir les champs automatiquement.') }}
          </p>
        </div>
      </template>

      <!-- ── Manual mode ────────────────────────────────── -->
      <UForm v-else ref="addressForm" :schema="schema" :state="store.address" class="space-y-4">
        <UFormField :label="t('events.stepper.localisation.place_name')" name="placeName">
          <template #hint>
            <span class="text-xs text-muted">{{ t('common.optional', 'Optionnel') }}</span>
          </template>
          <UInput
            v-model="store.address.placeName"
            :placeholder="t('events.stepper.localisation.place_name_placeholder', 'Ex : Palais des Sports…')"
            leading-icon="i-lucide-building-2"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('events.stepper.localisation.street_label')" name="street" required>
          <UInput
            v-model="store.address.street"
            :placeholder="t('events.stepper.localisation.street_placeholder')"
            leading-icon="i-lucide-map-pin"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <UFormField :label="t('events.stepper.localisation.zip_label')" name="zipCode" required class="sm:col-span-2">
            <UInput
              v-model="store.address.zipCode"
              :placeholder="t('events.stepper.localisation.zip_placeholder', '1234')"
              leading-icon="i-lucide-hash"
              size="lg"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('events.stepper.localisation.city_label')" name="city" required class="sm:col-span-3">
            <UInput
              v-model="store.address.city"
              :placeholder="t('events.stepper.localisation.city_placeholder', 'Luxembourg')"
              leading-icon="i-lucide-landmark"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField :label="t('events.stepper.localisation.country_label')" name="selectedCountry" required>
          <USelectMenu
            v-model="store.address.selectedCountry"
            :items="countries"
            value-key="value"
            :placeholder="t('events.stepper.localisation.country_placeholder')"
            leading-icon="i-lucide-globe"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </UForm>

      <!-- ── Carte ─────────────────────────────────────── -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-highlighted">
            {{ t('events.localisation.map_title', 'Carte') }}
          </p>
          <UBadge v-if="mapSrc" color="success" variant="subtle" size="xs">
            <UIcon name="i-lucide-check-circle-2" class="mr-1 size-3" />
            Localisé
          </UBadge>
        </div>

        <div class="h-44 w-full overflow-hidden rounded-lg bg-muted/30">
          <iframe
            v-if="mapSrc"
            :src="mapSrc"
            class="h-full w-full border-0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
          <div v-else class="flex h-full flex-col items-center justify-center gap-2 text-center p-4">
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
            class="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5"
          >
            <UIcon name="i-lucide-map-pin-check" class="mt-0.5 size-4 shrink-0 text-primary" />
            <p class="text-xs text-muted">{{ formattedAddress }}</p>
          </div>
        </Transition>
      </div>

    </div>
  </UCard>
</template>
