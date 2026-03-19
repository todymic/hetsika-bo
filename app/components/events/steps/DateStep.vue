<script setup lang="ts">
import { type DateValue, today, getLocalTimeZone } from '@internationalized/date'

const { t } = useI18n()
const store = useEventFormStore()

const todayDate        = today(getLocalTimeZone())
const startPopoverOpen = ref(false)
const endPopoverOpen   = ref(false)

// ── Computed wrappers: DateValue | undefined → DateValue ───
const startDateModel = computed({
  get: () => (store.dates.startDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { store.dates.startDate = val },
})

const endDateModel = computed({
  get: () => (store.dates.endDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { store.dates.endDate = val },
})

// ── Display helpers ────────────────────────────────────────
function formatDate(date: DateValue | undefined, time?: string) {
  if (!date) return null
  const d = new Intl.DateTimeFormat('fr', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date.toDate(getLocalTimeZone()))
  return time ? `${d} à ${time}` : d
}

const startDisplay = computed(() => formatDate(store.dates.startDate as DateValue | undefined, store.dates.startTime))
const endDisplay   = computed(() => formatDate(store.dates.endDate   as DateValue | undefined, store.dates.endTime))

// ── Cross-validation ───────────────────────────────────────
const isEndBeforeStart = computed(() => {
  const startDate = store.dates.startDate as DateValue | undefined
  const endDate   = store.dates.endDate   as DateValue | undefined
  const { startTime, endTime } = store.dates

  if (!startDate || !endDate) return false
  const cmp = endDate.compare(startDate)
  if (cmp < 0) return true
  if (cmp === 0 && startTime && endTime) return endTime <= startTime
  return false
})

// ── Duration ───────────────────────────────────────────────
const duration = computed(() => {
  const { startDate, startTime, endDate, endTime, hasEndDate } = store.dates
  if (!startDate || !startTime || !hasEndDate || !endDate || !endTime) return null
  if (isEndBeforeStart.value) return null

  const start   = new Date(`${startDate.toString()}T${startTime}`)
  const end     = new Date(`${endDate.toString()}T${endTime}`)
  const total   = Math.floor((end.getTime() - start.getTime()) / 60000)
  const days    = Math.floor(total / 1440)
  const hours   = Math.floor((total % 1440) / 60)
  const minutes = total % 60

  return [days && `${days}j`, hours && `${hours}h`, minutes && `${minutes}min`]
    .filter(Boolean).join(' ')
})

// ── Watchers ───────────────────────────────────────────────
watch(() => store.dates.hasEndDate, (val) => {
  if (!val) { store.dates.endDate = undefined; store.dates.endTime = '' }
})

watch(() => store.dates.startDate, () => { startPopoverOpen.value = false })
watch(() => store.dates.endDate,   () => { endPopoverOpen.value   = false })

// ── Validation ────────────────────────────────────────────
const dateError = ref('')

async function validate(): Promise<boolean> {
  if (!store.dates.startDate || !store.dates.startTime) {
    dateError.value = t('events.stepper.dates.start_at_required')
    return false
  }
  if (isEndBeforeStart.value) {
    dateError.value = t('events.stepper.dates.end_before_start_error', 'La date de fin doit être après le début.')
    return false
  }
  dateError.value = ''
  return true
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
          <UIcon name="i-lucide-calendar-clock" class="size-5" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-highlighted">
            {{ t('events.stepper.dates.subtitle', 'Dates & horaires') }}
          </h1>
          <p class="mt-0.5 text-sm text-muted">
            {{ t('events.stepper.dates.subtitle_hint', 'Définissez quand se déroule votre événement.') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Body ───────────────────────────────────────────── -->
    <div class="space-y-6">

      <!-- Start -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-primary" />
          <span class="text-sm font-medium text-highlighted">
            {{ t('events.stepper.dates.start_label', 'Début') }}
            <span class="ml-1 text-xs text-error">*</span>
          </span>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UPopover v-model:open="startPopoverOpen">
            <UButton
              variant="outline" size="lg" icon="i-lucide-calendar"
              class="w-full justify-start font-normal"
              :class="!store.dates.startDate ? 'text-muted' : ''"
            >
              {{ store.dates.startDate
              ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                .format(store.dates.startDate.toDate(getLocalTimeZone()))
              : t('events.stepper.dates.pick_date', 'Choisir une date') }}
            </UButton>
            <template #content>
              <UCalendar v-model="startDateModel" :min-value="todayDate" class="p-3" />
            </template>
          </UPopover>

          <UInput
            v-model="store.dates.startTime"
            type="time"
            leading-icon="i-lucide-clock"
            size="lg"
            class="w-full"
          />
        </div>

        <!-- Error message outside the grid -->
        <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0">
          <p v-if="dateError" class="flex items-center gap-1.5 text-xs text-error">
            <UIcon name="i-lucide-alert-circle" class="size-3.5" />
            {{ dateError }}
          </p>
        </Transition>

        <!-- Start date preview -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p v-if="startDisplay && !dateError" class="flex items-center gap-1.5 text-xs text-muted capitalize">
            <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-success" />
            {{ startDisplay }}
          </p>
        </Transition>
      </div>

      <!-- End date toggle -->
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-border" />
        <UCheckbox
          v-model="store.dates.hasEndDate"
          :label="t('events.stepper.dates.end_toggle', 'Ajouter une date de fin')"
        />
        <div class="h-px flex-1 bg-border" />
      </div>

      <!-- End -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="store.dates.hasEndDate" class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-muted" />
            <span class="text-sm font-medium text-highlighted">
              {{ t('events.stepper.dates.end_label', 'Fin') }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UPopover v-model:open="endPopoverOpen">
              <UButton
                variant="outline" size="lg" icon="i-lucide-calendar"
                class="w-full justify-start font-normal"
                :class="!store.dates.endDate ? 'text-muted' : ''"
              >
                {{ store.dates.endDate
                ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                  .format(store.dates.endDate.toDate(getLocalTimeZone()))
                : t('events.stepper.dates.pick_date', 'Choisir une date') }}
              </UButton>
              <template #content>
                <UCalendar v-model="endDateModel" :min-value="startDateModel" class="p-3" />
              </template>
            </UPopover>

            <UInput
              v-model="store.dates.endTime"
              type="time"
              leading-icon="i-lucide-clock"
              size="lg"
              class="w-full"
            />
          </div>

          <!-- End date error -->
          <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0">
            <p v-if="isEndBeforeStart" class="flex items-center gap-1.5 text-xs text-error">
              <UIcon name="i-lucide-alert-circle" class="size-3.5" />
              {{ t('events.stepper.dates.end_before_start_error', 'La date de fin doit être après le début.') }}
            </p>
          </Transition>

          <!-- End date preview -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <p v-if="endDisplay && !isEndBeforeStart" class="flex items-center gap-1.5 text-xs text-muted capitalize">
              <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-success" />
              {{ endDisplay }}
            </p>
          </Transition>
        </div>
      </Transition>

      <!-- Duration recap -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="duration" class="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <UIcon name="i-lucide-timer" class="size-4 shrink-0 text-primary" />
          <span class="text-sm font-medium text-primary">
            {{ t('events.stepper.dates.duration_label', 'Durée') }}
          </span>
          <span class="text-sm text-muted">{{ duration }}</span>
        </div>
      </Transition>

    </div>
  </UCard>
</template>
