<script setup lang="ts">
const { t } = useI18n()
const store = useEventFormStore()

const hasInfo     = computed(() => !!store.info.title || store.info.selectedCategories.length > 0)
const hasAddress  = computed(() => !!store.address.street || !!store.address.city)
const hasDates    = computed(() => !!store.dates.startDate)
const hasTickets  = computed(() => store.tickets.length > 0)

const coverUrl = computed(() => {
  const uploaded = store.info.uploadedFiles?.[0]?.preview
  if (uploaded) return uploaded
  const existing = store.info.existingFiles?.find((f: any) => f.isCover) ?? store.info.existingFiles?.[0]
  return existing?.url ?? null
})

function formatDateValue(date: any, time?: string): string {
  if (!date) return ''
  try {
    const d = new Intl.DateTimeFormat('fr', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(typeof date.toDate === 'function' ? date.toDate('UTC') : new Date(date))
    return time ? `${d} à ${time}` : d
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-semibold uppercase tracking-widest text-muted px-1">
      {{ t('events.create.summary', 'Récapitulatif') }}
    </p>

    <!-- Pas encore rempli -->
    <div
      v-if="!hasInfo && !hasAddress && !hasDates && !hasTickets"
      class="rounded-xl border border-dashed border-default p-6 text-center"
    >
      <UIcon name="i-lucide-clipboard-list" class="size-8 text-muted mx-auto mb-2" />
      <p class="text-xs text-muted">
        {{ t('events.create.summary_empty', 'Remplissez les étapes pour voir le récapitulatif') }}
      </p>
    </div>

    <template v-else>

      <!-- Cover -->
      <div v-if="coverUrl" class="overflow-hidden rounded-xl border border-default">
        <img :src="coverUrl" alt="Couverture" class="h-32 w-full object-cover" />
      </div>

      <!-- Infos -->
      <UCard v-if="hasInfo">
        <div>cdsfsf</div>
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <UIcon name="i-lucide-file-text" class="size-3.5 text-primary" />
            </div>
            <span class="text-xs font-semibold text-highlighted uppercase tracking-wide">
              {{ t('events.dashboard.menu.info', 'Informations') }}
            </span>
          </div>

          <div v-if="store.info.title">
            <p class="text-xs text-muted">{{ t('events.stepper.info.title_label', 'Titre') }}</p>
            <p class="text-sm font-medium text-highlighted truncate">{{ store.info.title }}</p>
          </div>

          <div v-if="store.info.selectedCategories.length">
            <p class="text-xs text-muted">{{ t('events.stepper.info.categories_label', 'Catégories') }}</p>
            <p class="text-sm text-highlighted">{{ store.info.selectedCategories.length }} sélectionnée(s)</p>
          </div>

          <div v-if="store.info.description">
            <p class="text-xs text-muted">{{ t('events.stepper.info.desc_label', 'Description') }}</p>
            <p class="text-xs text-muted line-clamp-2">
              {{ store.info.description.replace(/[#*`_~[\]]/g, '') }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Localisation -->
      <UCard v-if="hasAddress">
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />
            </div>
            <span class="text-xs font-semibold text-highlighted uppercase tracking-wide">
              {{ t('events.dashboard.menu.localisation', 'Localisation') }}
            </span>
          </div>

          <div v-if="store.address.placeName">
            <p class="text-xs text-muted">{{ t('events.stepper.localisation.place_name', 'Lieu') }}</p>
            <p class="text-sm font-medium text-highlighted truncate">{{ store.address.placeName }}</p>
          </div>

          <div v-if="store.address.street">
            <p class="text-xs text-muted">{{ t('events.stepper.localisation.street_label', 'Adresse') }}</p>
            <p class="text-xs text-highlighted">
              {{ [store.address.street, store.address.zipCode, store.address.city].filter(Boolean).join(', ') }}
            </p>
          </div>

          <div v-if="store.address.selectedCountry">
            <p class="text-xs text-muted">{{ t('events.stepper.localisation.country_label', 'Pays') }}</p>
            <p class="text-sm text-highlighted">{{ store.address.selectedCountry }}</p>
          </div>
        </div>
      </UCard>

      <!-- Dates -->
      <UCard v-if="hasDates">
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <UIcon name="i-lucide-calendar-clock" class="size-3.5 text-primary" />
            </div>
            <span class="text-xs font-semibold text-highlighted uppercase tracking-wide">
              {{ t('events.stepper.dates.subtitle', 'Dates') }}
            </span>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-start gap-1.5">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <div>
                <p class="text-xs text-muted">{{ t('events.stepper.dates.start_label', 'Début') }}</p>
                <p class="text-xs font-medium text-highlighted capitalize">
                  {{ formatDateValue(store.dates.startDate, store.dates.startTime) }}
                </p>
              </div>
            </div>

            <div v-if="store.dates.hasEndDate && store.dates.endDate" class="flex items-start gap-1.5">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted shrink-0" />
              <div>
                <p class="text-xs text-muted">{{ t('events.stepper.dates.end_label', 'Fin') }}</p>
                <p class="text-xs font-medium text-highlighted capitalize">
                  {{ formatDateValue(store.dates.endDate, store.dates.endTime) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Tickets -->
      <UCard v-if="hasTickets">
        <div class="space-y-2">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <UIcon name="i-lucide-ticket" class="size-3.5 text-primary" />
              </div>
              <span class="text-xs font-semibold text-highlighted uppercase tracking-wide">
                {{ t('events.stepper.tickets.subtitle', 'Billets') }}
              </span>
            </div>
            <UBadge variant="subtle" size="xs">{{ store.tickets.length }}</UBadge>
          </div>

          <div class="space-y-1">
            <div
              v-for="(ticket, i) in store.tickets.slice(0, 3)"
              :key="i"
              class="flex items-center justify-between rounded-md bg-muted/20 px-2 py-1.5"
            >
              <p class="text-xs font-medium text-highlighted truncate max-w-[120px]">
                {{ (ticket as any).name }}
              </p>
              <p class="text-xs text-muted shrink-0">
                {{ (ticket as any).price === 0
                ? 'Gratuit'
                : `${Number((ticket as any).price).toFixed(2)} ${(ticket as any).currency}` }}
              </p>
            </div>
            <p v-if="store.tickets.length > 3" class="text-xs text-muted text-center pt-1">
              + {{ store.tickets.length - 3 }} autre(s)
            </p>
          </div>
        </div>
      </UCard>

    </template>
  </div>
</template>
