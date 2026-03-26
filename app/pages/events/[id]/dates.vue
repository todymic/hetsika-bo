<script setup lang="ts">
import { type DateValue, today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                           = useI18n()
const route                           = useRoute()
const toast                           = useToast()
const { getEvent, updateEventDates }  = useEventStore()
const eventId                         = Number(route.params.id)

const pending          = ref(true)
const saving           = ref(false)
const startPopoverOpen = ref(false)
const endPopoverOpen   = ref(false)
const todayDate        = today(getLocalTimeZone())

const state = ref<{
  startDate:  DateValue | undefined
  startTime:  string
  endDate:    DateValue | undefined
  endTime:    string
  hasEndDate: boolean
}>({
  startDate: undefined, startTime: '',
  endDate:   undefined, endTime:   '',
  hasEndDate: false,
})

function dateToCalendar(date: Date | string): CalendarDate {
  const d = new Date(date)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function dateToTime(date: Date | string): string {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function toISO(date: DateValue, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = date.toDate(getLocalTimeZone())
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toISOString()
}

const startDateModel = computed({
  get: () => (state.value.startDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { state.value.startDate = val },
})

const endDateModel = computed({
  get: () => (state.value.endDate ?? todayDate) as DateValue,
  set: (val: DateValue) => { state.value.endDate = val },
})

function formatDate(date: DateValue | undefined, time?: string) {
  if (!date) return null
  const d = new Intl.DateTimeFormat('fr', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date.toDate(getLocalTimeZone()))
  return time ? `${d} à ${time}` : d
}

const startDisplay     = computed(() => formatDate(state.value.startDate as DateValue | undefined, state.value.startTime))
const endDisplay       = computed(() => formatDate(state.value.endDate   as DateValue | undefined, state.value.endTime))
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

watch(() => state.value.startDate, () => { startPopoverOpen.value = false })
watch(() => state.value.endDate,   () => { endPopoverOpen.value   = false })
watch(() => state.value.hasEndDate, (val) => {
  if (!val) { state.value.endDate = undefined; state.value.endTime = '' }
})

onMounted(async () => {
  try {
    const event = await getEvent(eventId)
    state.value.startDate = dateToCalendar(event.startAt)
    state.value.startTime = dateToTime(event.startAt)
    if (event.endAt) {
      state.value.endDate   = dateToCalendar(event.endAt)
      state.value.endTime   = dateToTime(event.endAt)
      state.value.hasEndDate = true
    }
  } finally {
    pending.value = false
  }
})

async function save() {
  if (!state.value.startDate || !state.value.startTime) {
    toast.add({ title: t('events.stepper.dates.start_at_required'), color: 'error' })
    return
  }
  if (isEndBeforeStart.value) {
    toast.add({ title: t('events.stepper.dates.end_before_start'), color: 'error' })
    return
  }

  saving.value = true
  try {
    await updateEventDates(eventId, {
      startAt: toISO(state.value.startDate as DateValue, state.value.startTime),
      endAt:   state.value.hasEndDate && state.value.endDate && state.value.endTime
        ? toISO(state.value.endDate as DateValue, state.value.endTime)
        : undefined,
    })
    toast.add({ title: t('events.section.dates_saved', 'Dates enregistrées'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">

    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-highlighted">
        {{ t('events.dashboard.menu.dates', 'Dates') }}
      </h1>
      <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">
        {{ t('common.save', 'Enregistrer') }}
      </UButton>
    </div>

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <div v-else class="space-y-6">

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
            <UButton variant="outline" size="lg" icon="i-lucide-calendar"
                     class="w-full justify-start font-normal"
                     :class="!state.startDate ? 'text-muted' : ''">
              {{ state.startDate
              ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                .format(state.startDate.toDate(getLocalTimeZone()))
              : t('events.stepper.dates.pick_date', 'Choisir une date') }}
            </UButton>
            <template #content>
              <UCalendar v-model="startDateModel" :min-value="todayDate" class="p-3" />
            </template>
          </UPopover>
          <UInput v-model="state.startTime" type="time" leading-icon="i-lucide-clock" size="lg" class="w-full" />
        </div>
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
          <p v-if="startDisplay" class="flex items-center gap-1.5 text-xs text-muted capitalize">
            <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-success" />
            {{ startDisplay }}
          </p>
        </Transition>
      </div>

      <!-- Toggle end -->
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-border" />
        <UCheckbox v-model="state.hasEndDate" :label="t('events.stepper.dates.end_toggle', 'Ajouter une date de fin')" />
        <div class="h-px flex-1 bg-border" />
      </div>

      <!-- End -->
      <Transition
        enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="state.hasEndDate" class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-muted" />
            <span class="text-sm font-medium text-highlighted">{{ t('events.stepper.dates.end_label', 'Fin') }}</span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UPopover v-model:open="endPopoverOpen">
              <UButton variant="outline" size="lg" icon="i-lucide-calendar"
                       class="w-full justify-start font-normal"
                       :class="!state.endDate ? 'text-muted' : ''">
                {{ state.endDate
                ? new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long', year: 'numeric' })
                  .format(state.endDate.toDate(getLocalTimeZone()))
                : t('events.stepper.dates.pick_date', 'Choisir une date') }}
              </UButton>
              <template #content>
                <UCalendar v-model="endDateModel" :min-value="startDateModel" class="p-3" />
              </template>
            </UPopover>
            <UInput v-model="state.endTime" type="time" leading-icon="i-lucide-clock" size="lg" class="w-full" />
          </div>
          <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0">
            <p v-if="isEndBeforeStart" class="flex items-center gap-1.5 text-xs text-error">
              <UIcon name="i-lucide-alert-circle" class="size-3.5" />
              {{ t('events.stepper.dates.end_before_start_error') }}
            </p>
          </Transition>
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
            <p v-if="endDisplay && !isEndBeforeStart" class="flex items-center gap-1.5 text-xs text-muted capitalize">
              <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-success" />
              {{ endDisplay }}
            </p>
          </Transition>
        </div>
      </Transition>

    </div>
  </div>
</template>
