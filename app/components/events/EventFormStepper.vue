<script setup lang="ts">
import type { StepperItem } from '#ui/components/Stepper.vue'

const props = defineProps<{
  mode:    'create' | 'edit'
  loading: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const { t } = useI18n()

const steps = ref<StepperItem[]>([
  { title: t('events.stepper.steps.info'),         icon: 'i-lucide-contact',       slot: 'info'         as const },
  { title: t('events.stepper.steps.localisation'),  icon: 'i-lucide-map-pin',       slot: 'localisation' as const },
  { title: t('events.stepper.steps.dates'),         icon: 'i-lucide-calendar-days', slot: 'date'         as const },
  { title: t('events.stepper.steps.tickets'),       icon: 'i-lucide-ticket',        slot: 'tickets'      as const },
])

// ── Manual index tracking ──────────────────────────────────
const stepIndex  = ref(0)
const hasPrev    = computed<boolean>(() => stepIndex.value > 0)
const hasNext    = computed<boolean>(() => stepIndex.value < steps.value.length - 1)
const isLastStep = computed<boolean>(() => !hasNext.value)

// ── Step refs ──────────────────────────────────────────────
const infoStep         = useTemplateRef('infoStep')
const localisationStep = useTemplateRef('localisationStep')
const dateStep         = useTemplateRef('dateStep')
const ticketsStep = useTemplateRef('ticketsStep')

const stepRefs = computed(() => [
  infoStep.value,
  localisationStep.value,
  dateStep.value,
  ticketsStep.value,
])


// ── Navigation ─────────────────────────────────────────────
async function handleNext() {
  const current = stepRefs.value[stepIndex.value]
  const valid   = await current?.validate()
  if (!valid) return

  if (isLastStep.value) {
    emit('submit')
  } else {
    stepIndex.value++
  }
}

function handlePrev() {
  stepIndex.value--
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <UStepper
      :disabled="mode === 'create'"
      :items="steps"
      orientation="horizontal"
      class="w-full"
      v-model="stepIndex"
      :linear=" mode !=='edit' "
      :ui="{
        root:      'w-full',
        item:      'flex-1',
        separator: 'flex-1',
        indicator: mode === 'edit' ? 'cursor-pointer' : '',
      }"
    >
      <template #info>         <EventsStepsInfoStep         ref="infoStep"         /> </template>
      <template #localisation> <EventsStepsLocalisationStep ref="localisationStep" /> </template>
      <template #date>         <EventsStepsDateStep         ref="dateStep"         /> </template>
      <template #tickets>      <EventsStepsTicketsStep      ref="ticketsStep"      /> </template>

    </UStepper>

    <!-- ── Navigation ─────────────────────────────────── -->
    <div class="flex items-center justify-between mt-4">
      <UButton
        variant="outline"
        leading-icon="i-lucide-arrow-left"
        :disabled="!hasPrev"
        @click="handlePrev"
      >
        {{ t('events.stepper.nav.prev', 'Previous') }}
      </UButton>

      <UButton
        :loading="loading"
        :trailing-icon="isLastStep
          ? (mode === 'edit' ? 'i-lucide-save' : 'i-lucide-send')
          : 'i-lucide-arrow-right'"
        @click="handleNext"
      >
        {{ isLastStep
        ? (mode === 'edit'
          ? t('events.stepper.nav.update', 'Mettre à jour')
          : t('events.stepper.nav.submit', 'Publier'))
        : t('events.stepper.nav.next', 'Next') }}
      </UButton>
    </div>
  </section>
</template>
