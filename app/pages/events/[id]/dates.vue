<script setup lang="ts">
import { type DateValue, today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                          = useI18n()
const route                          = useRoute()
const toast                          = useToast()
const { getEvent, updateEventDates } = useEventStore()
const eventId                        = Number(route.params.id)

const pending = ref(true)
const saving  = ref(false)

// ── Mode ───────────────────────────────────────────────────
type EventMode = 'single' | 'recurring'
const eventMode = ref<EventMode>('single')

// ── Dates ──────────────────────────────────────────────────
const todayDate        = today(getLocalTimeZone())
const startPopoverOpen = ref(false)
const endPopoverOpen   = ref(false)
const hasEndTime       = ref(true)

const state = ref<{
  startDate: DateValue | undefined
  startTime: string
  endDate:   DateValue | undefined
  endTime:   string
}>({
  startDate: undefined, startTime: '',
  endDate:   undefined, endTime:   '',
})

const startDateModel = computed({
  get: () => (state.value.startDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { state.value.startDate = val },
})
const endDateModel = computed({
  get: () => (state.value.endDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { state.value.endDate = val },
})

watch(() => state.value.startDate, () => { startPopoverOpen.value = false })
watch(() => state.value.endDate,   () => { endPopoverOpen.value   = false })

function formatDateValue(date: DateValue | undefined, time?: string) {
  if (!date) return null
  const d = new Intl.DateTimeFormat('fr', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date.toDate(getLocalTimeZone()))
  return time ? `${d} à ${time}` : d
}

const startDisplay = computed(() =>
  formatDateValue(state.value.startDate as DateValue | undefined, state.value.startTime)
)

const isEndBeforeStart = computed(() => {
  const s = state.value.startDate as DateValue | undefined
  const e = state.value.endDate   as DateValue | undefined
  if (!s || !e) return false
  const cmp = e.compare(s)
  if (cmp < 0) return true
  if (cmp === 0 && state.value.startTime && state.value.endTime)
    return state.value.endTime <= state.value.startTime
  return false
})

const duration = computed(() => {
  if (!state.value.startDate || !state.value.startTime) return null
  if (!hasEndTime.value || !state.value.endDate || !state.value.endTime) return null
  if (isEndBeforeStart.value) return null
  const start   = new Date(`${state.value.startDate.toString()}T${state.value.startTime}`)
  const end     = new Date(`${state.value.endDate.toString()}T${state.value.endTime}`)
  const total   = Math.floor((end.getTime() - start.getTime()) / 60000)
  const days    = Math.floor(total / 1440)
  const hours   = Math.floor((total % 1440) / 60)
  const minutes = total % 60
  return [days && `${days}j`, hours && `${hours}h`, minutes && `${minutes}min`].filter(Boolean).join(' ')
})

// ── Récurrence ─────────────────────────────────────────────
type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom'
const frequency      = ref<Frequency>('weekly')
const activeDays     = ref<number[]>([1, 3, 5])
const recurEndDate   = ref<DateValue | undefined>()
const maxOccurrences = ref<number | null>(null)
const recurEndPopover = ref(false)

const recurEndModel = computed({
  get: () => (recurEndDate.value ?? todayDate) as DateValue,
  set: (val: DateValue) => { recurEndDate.value = val },
})

watch(recurEndDate, () => { recurEndPopover.value = false })

interface Occurrence { date: DateValue; startTime: string; endTime: string }
const occurrences = ref<Occurrence[]>([])

const DAYS = [
  { label: 'L', value: 1 }, { label: 'M', value: 2 }, { label: 'M', value: 3 },
  { label: 'J', value: 4 }, { label: 'V', value: 5 }, { label: 'S', value: 6 },
  { label: 'D', value: 0 },
]

function toggleDay(day: number) {
  const idx = activeDays.value.indexOf(day)
  if (idx === -1) activeDays.value.push(day)
  else activeDays.value.splice(idx, 1)
}

function generateOccurrences() {
  if (!state.value.startDate || !state.value.startTime) return
  const occ: Occurrence[] = []
  const maxDate = recurEndDate.value
  const max     = maxOccurrences.value ?? 52
  let current   = state.value.startDate as DateValue
  let count     = 0

  while (count < max) {
    if (maxDate && current.compare(maxDate) > 0) break
    const dow = current.toDate(getLocalTimeZone()).getDay()
    const shouldInclude =
      frequency.value === 'daily' ||
      (frequency.value === 'weekly'  && activeDays.value.includes(dow)) ||
      (frequency.value === 'monthly' && current.day === (state.value.startDate as DateValue).day)

    if (shouldInclude) {
      occ.push({ date: current, startTime: state.value.startTime, endTime: state.value.endTime })
      count++
    }

    const d = current.toDate(getLocalTimeZone())
    d.setDate(d.getDate() + 1)
    current = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }
  occurrences.value = occ
}

watch([frequency, activeDays, recurEndDate, maxOccurrences, () => state.value.startDate], generateOccurrences)

function removeOccurrence(index: number) { occurrences.value.splice(index, 1) }

function formatOccDate(date: DateValue) {
  return new Intl.DateTimeFormat('fr', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(date.toDate(getLocalTimeZone()))
}

// ── Unsaved changes ────────────────────────────────────────
const original = ref('')
const isDirty  = computed(() => JSON.stringify(state.value) !== original.value)
function markSaved() { original.value = JSON.stringify(state.value) }
function cancelChanges() { state.value = JSON.parse(original.value) }

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm(t('common.unsaved_confirm', 'Vous avez des modifications non enregistrées. Quitter quand même ?'))
})

const completenessFields = computed(() => [
  { key: 'startDate', filled: !!state.value.startDate },
  { key: 'startTime', filled: !!state.value.startTime },
  { key: 'endDate',   filled: !hasEndTime.value || !!state.value.endDate },
  { key: 'endTime',   filled: !hasEndTime.value || !!state.value.endTime },
])

// ── Helpers ────────────────────────────────────────────────
function toISO(date: DateValue, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = date.toDate(getLocalTimeZone())
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toISOString()
}

function dateToCalendar(date: Date | string): CalendarDate {
  const d = new Date(date)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function dateToTime(date: Date | string): string {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ── Mount ──────────────────────────────────────────────────
onMounted(async () => {
  try {
    const event = await getEvent(eventId)
    state.value.startDate = dateToCalendar(event.startAt)
    state.value.startTime = dateToTime(event.startAt)
    if (event.endAt) {
      state.value.endDate = dateToCalendar(event.endAt)
      state.value.endTime = dateToTime(event.endAt)
      hasEndTime.value    = true
    }
    markSaved()
  } finally {
    pending.value = false
  }
})

// ── Save ───────────────────────────────────────────────────
async function save() {
  if (!state.value.startDate || !state.value.startTime) {
    toast.add({ title: t('events.stepper.dates.start_at_required'), color: 'error' })
    return
  }
  if (isEndBeforeStart.value) {
    toast.add({ title: t('events.stepper.dates.end_before_start_error'), color: 'error' })
    return
  }
  saving.value = true
  try {
    await updateEventDates(eventId, {
      startAt: toISO(state.value.startDate as DateValue, state.value.startTime),
      endAt:   hasEndTime.value && state.value.endDate && state.value.endTime
        ? toISO(state.value.endDate as DateValue, state.value.endTime)
        : undefined,
      occurrences: eventMode.value === 'recurring'
        ? occurrences.value.map(o => ({
          startAt: toISO(o.date, o.startTime),
          endAt:   o.endTime ? toISO(o.date, o.endTime) : undefined,
        }))
        : undefined,
    })
    markSaved()
    toast.add({ title: t('events.section.dates_saved', 'Dates enregistrées'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-5 p-6">

    <EventsDashboardPageHeader
      icon="i-lucide-calendar-days"
      :title="t('events.dashboard.menu.dates', 'Dates')"
      :description="t('events.stepper.dates.subtitle_hint', 'Définissez quand se déroule votre événement')"
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

        <!-- ── Formulaire dates (3/5) ─────────────────── -->
        <div class="space-y-5 lg:col-span-3">

          <UCard>
            <template #header>
              <p class="text-sm font-semibold text-highlighted">
                {{ t('events.dates.event_type', 'Type d\'événement') }}
              </p>
            </template>

            <!-- Mode selector -->
            <div class="mb-5 flex rounded-lg bg-muted/30 p-1 gap-1">
              <button
                v-for="m in [
                  { key: 'single',    icon: 'i-lucide-calendar', label: t('events.dates.single',    'Ponctuel')  },
                  { key: 'recurring', icon: 'i-lucide-repeat',   label: t('events.dates.recurring', 'Récurrent') },
                ]"
                :key="m.key"
                class="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm transition-all"
                :class="eventMode === m.key
                  ? 'bg-background font-medium text-highlighted border border-default'
                  : 'text-muted hover:text-highlighted'"
                @click="eventMode = m.key as EventMode"
              >
                <UIcon :name="m.icon" class="size-4" />
                {{ m.label }}
              </button>
            </div>

            <!-- Start -->
            <div class="mb-5 space-y-2">
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary" />
                <span class="text-sm font-medium text-highlighted">
                  {{ t('events.stepper.dates.start_label', 'Début') }}
                  <span class="ml-1 text-xs text-error">*</span>
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <UPopover v-model:open="startPopoverOpen">
                  <UButton
                    variant="outline" size="lg" icon="i-lucide-calendar"
                    class="w-full justify-start font-normal"
                    :class="!state.startDate ? 'text-muted' : ''"
                  >
                    {{ state.startDate
                    ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                      .format((state.startDate as DateValue).toDate(getLocalTimeZone()))
                    : t('events.stepper.dates.pick_date', 'Choisir une date') }}
                  </UButton>
                  <template #content>
                    <UCalendar v-model="startDateModel" :min-value="todayDate" class="p-3" />
                  </template>
                </UPopover>
                <UInput
                  v-model="state.startTime"
                  type="time"
                  leading-icon="i-lucide-clock"
                  size="lg"
                  class="w-full"
                />
              </div>
              <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
                <p v-if="startDisplay" class="flex items-center gap-1.5 text-xs text-muted capitalize">
                  <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-success" />
                  {{ startDisplay }}
                </p>
              </Transition>
            </div>

            <!-- End toggle -->
            <div class="mb-5">
              <UCheckbox
                v-model="hasEndTime"
                :label="t('events.stepper.dates.end_toggle', 'Ajouter une heure de fin')"
              />
            </div>

            <!-- End -->
            <Transition
              enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-if="hasEndTime" class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-muted" />
                  <span class="text-sm font-medium text-highlighted">
                    {{ t('events.stepper.dates.end_label', 'Fin') }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <UPopover v-model:open="endPopoverOpen">
                    <UButton
                      variant="outline" size="lg" icon="i-lucide-calendar"
                      class="w-full justify-start font-normal"
                      :class="!state.endDate ? 'text-muted' : ''"
                    >
                      {{ state.endDate
                      ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                        .format((state.endDate as DateValue).toDate(getLocalTimeZone()))
                      : t('events.stepper.dates.pick_date', 'Choisir') }}
                    </UButton>
                    <template #content>
                      <UCalendar v-model="endDateModel" :min-value="startDateModel" class="p-3" />
                    </template>
                  </UPopover>
                  <UInput
                    v-model="state.endTime"
                    type="time"
                    leading-icon="i-lucide-clock"
                    size="lg"
                    class="w-full"
                  />
                </div>
                <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0">
                  <p v-if="isEndBeforeStart" class="flex items-center gap-1.5 text-xs text-error">
                    <UIcon name="i-lucide-alert-circle" class="size-3.5" />
                    {{ t('events.stepper.dates.end_before_start_error') }}
                  </p>
                </Transition>
              </div>
            </Transition>

            <!-- Duration -->
            <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <div
                v-if="duration"
                class="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <UIcon name="i-lucide-timer" class="size-4 shrink-0 text-primary" />
                <span class="text-sm font-medium text-primary">{{ t('events.stepper.dates.duration_label', 'Durée') }}</span>
                <span class="text-sm text-muted">{{ duration }}</span>
              </div>
            </Transition>
          </UCard>

          <!-- Recurring config -->
          <Transition
            enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0"
          >
            <UCard v-if="eventMode === 'recurring'">
              <template #header>
                <p class="flex items-center gap-2 text-sm font-semibold text-highlighted">
                  <UIcon name="i-lucide-repeat" class="size-4 text-primary" />
                  {{ t('events.dates.recurrence_config', 'Configuration de la récurrence') }}
                </p>
              </template>

              <div class="space-y-5">

                <!-- Frequency -->
                <div>
                  <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    {{ t('events.dates.frequency', 'Fréquence') }}
                  </p>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="f in [
                        { key: 'daily',   label: t('events.dates.daily',   'Quotidien') },
                        { key: 'weekly',  label: t('events.dates.weekly',  'Hebdo')     },
                        { key: 'monthly', label: t('events.dates.monthly', 'Mensuel')   },
                        { key: 'custom',  label: t('events.dates.custom',  'Perso')     },
                      ]"
                      :key="f.key"
                      class="rounded-lg border py-2 text-center text-xs font-medium transition-colors"
                      :class="frequency === f.key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-default text-muted hover:text-highlighted'"
                      @click="frequency = f.key as Frequency"
                    >
                      {{ f.label }}
                    </button>
                  </div>
                </div>

                <!-- Days -->
                <div v-if="frequency === 'weekly' || frequency === 'custom'">
                  <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    {{ t('events.dates.active_days', 'Jours actifs') }}
                  </p>
                  <div class="flex gap-2">
                    <button
                      v-for="d in DAYS"
                      :key="d.value"
                      class="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium transition-colors"
                      :class="activeDays.includes(d.value)
                        ? 'border-primary bg-primary text-white'
                        : 'border-default text-muted hover:text-highlighted'"
                      @click="toggleDay(d.value)"
                    >
                      {{ d.label }}
                    </button>
                  </div>
                </div>

                <!-- End of recurrence -->
                <div class="grid grid-cols-2 gap-4">
                  <UFormField :label="t('events.dates.recur_end', 'Fin de récurrence')">
                    <UPopover v-model:open="recurEndPopover">
                      <UButton
                        variant="outline" size="sm" icon="i-lucide-calendar"
                        class="w-full justify-start font-normal text-sm"
                        :class="!recurEndDate ? 'text-muted' : ''"
                      >
                        {{ recurEndDate
                        ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'short', year: 'numeric' })
                          .format((recurEndDate as DateValue).toDate(getLocalTimeZone()))
                        : t('events.stepper.dates.pick_date', 'Choisir') }}
                      </UButton>
                      <template #content>
                        <UCalendar v-model="recurEndModel" :min-value="startDateModel" class="p-3" />
                      </template>
                    </UPopover>
                  </UFormField>

                  <UFormField :label="t('events.dates.max_occurrences', 'Ou N occurrences')">
                    <UInput
                      v-model.number="maxOccurrences"
                      type="number"
                      min="1"
                      :placeholder="t('events.dates.max_occ_placeholder', 'Ex : 10')"
                      size="sm"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <UButton
                  variant="outline"
                  size="sm"
                  icon="i-lucide-refresh-cw"
                  class="w-full"
                  @click="generateOccurrences"
                >
                  {{ t('events.dates.generate', 'Générer les occurrences') }}
                </UButton>

              </div>
            </UCard>
          </Transition>

        </div>

        <!-- ── Résumé + Quick links (2/5) ─────────────── -->
        <div class="space-y-5 lg:col-span-2">

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-highlighted">
                  {{ eventMode === 'recurring'
                  ? t('events.dates.occurrences', 'Occurrences')
                  : t('events.dates.summary', 'Résumé') }}
                </p>
                <UBadge v-if="eventMode === 'recurring'" color="neutral" variant="subtle" size="xs">
                  {{ occurrences.length }} dates
                </UBadge>
              </div>
            </template>

            <!-- Single summary -->
            <div v-if="eventMode === 'single'" class="space-y-3">
              <div v-if="state.startDate" class="rounded-lg border border-default p-3 space-y-2">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-primary" />
                  <span class="text-xs font-medium text-highlighted capitalize">
                    {{ formatOccDate(state.startDate as DateValue) }}
                  </span>
                </div>
                <p class="pl-4 text-xs text-muted">
                  {{ state.startTime }}
                  <span v-if="hasEndTime && state.endTime"> → {{ state.endTime }}</span>
                  <span v-if="duration" class="ml-2 font-medium text-primary">({{ duration }})</span>
                </p>
              </div>
              <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
                <UIcon name="i-lucide-calendar-x" class="size-6 text-muted" />
                <p class="text-xs text-muted">{{ t('events.dates.no_date', 'Aucune date sélectionnée') }}</p>
              </div>
            </div>

            <!-- Recurring list -->
            <div v-else>
              <div v-if="occurrences.length" class="max-h-64 space-y-1.5 overflow-y-auto">
                <div
                  v-for="(occ, i) in occurrences"
                  :key="i"
                  class="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
                >
                  <div>
                    <p class="text-xs font-medium text-highlighted capitalize">{{ formatOccDate(occ.date) }}</p>
                    <p class="text-xs text-muted">
                      {{ occ.startTime }}<span v-if="occ.endTime"> → {{ occ.endTime }}</span>
                    </p>
                  </div>
                  <button
                    class="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:text-error"
                    @click="removeOccurrence(i)"
                  >
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </button>
                </div>
              </div>

              <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
                <UIcon name="i-lucide-calendar-range" class="size-6 text-muted" />
                <p class="text-xs font-medium text-highlighted">
                  {{ t('events.dates.no_occurrences', 'Aucune occurrence') }}
                </p>
                <p class="text-xs text-muted">
                  {{ t('events.dates.generate_hint', 'Configurez la récurrence puis cliquez sur Générer') }}
                </p>
              </div>

              <div
                v-if="occurrences.length"
                class="mt-3 flex items-start gap-2 rounded-lg bg-muted/20 px-3 py-2.5"
              >
                <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-muted" />
                <p class="text-xs text-muted">
                  {{ t('events.dates.occurrences_hint', 'Supprimez des occurrences individuellement avant de sauvegarder.') }}
                </p>
              </div>
            </div>
          </UCard>

          <EventsDashboardQuickLinks :event-id="eventId" :current="`/events/${eventId}/dates`" />

        </div>
      </div>
    </template>
  </div>
</template>
