<script setup lang="ts">
import type { StepperItem } from '#ui/components/Stepper.vue'
import { useEventStore } from "~/stores/eventStore"

const { t }  = useI18n()
const store  = useEventFormStore()
const router = useRouter()
const toast  = useToast()
const { createEvent } = useEventStore()

const steps = ref<StepperItem[]>([
  { title: t('events.stepper.steps.info'),        icon: 'i-lucide-contact',       slot: 'info'         as const },
  { title: t('events.stepper.steps.localisation'), icon: 'i-lucide-map-pin',       slot: 'localisation' as const },
  { title: t('events.stepper.steps.dates'),        icon: 'i-lucide-calendar-days', slot: 'date'         as const },
])

const stepper  = useTemplateRef('stepper')
const loading  = ref(false)

// ── Manual index tracking ──────────────────────────────────
const stepIndex  = ref(0)
const hasPrev    = computed<boolean>(() => stepIndex.value > 0)
const hasNext    = computed<boolean>(() => stepIndex.value < steps.value.length - 1)
const isLastStep = computed<boolean>(() => !hasNext.value)

// ── Step refs ──────────────────────────────────────────────
const infoStep         = useTemplateRef('infoStep')
const localisationStep = useTemplateRef('localisationStep')
const dateStep         = useTemplateRef('dateStep')

const stepRefs = computed(() => [
  infoStep.value,
  localisationStep.value,
  dateStep.value,
])

// ── Navigation ─────────────────────────────────────────────
async function handleNext() {


  const current = stepRefs.value[stepIndex.value]
  const valid   = await current?.validate()


  if (!valid) {
    console.log('form not valid')
    return
  }

  if (isLastStep.value) {
    await submit()
  } else {
    stepper.value?.next()
    stepIndex.value++
  }
}

function handlePrev() {
  stepper.value?.prev()
  stepIndex.value--

  console.log(stepIndex.value)
}

// ── Submit ─────────────────────────────────────────────────
async function submit() {
  loading.value = true
  try {
    const payload = store.buildPayload()

    const form = new FormData()
    form.append('event', JSON.stringify(payload))
    store.info.files.forEach(file => form.append('files[]', file))

    const response = await createEvent(form)

    if (response.status === 'success') {
      toast.add({ title: t('events.create.success', 'Événement créé !'), color: 'success' })
      store.reset()
      await router.push('/events')
    }
  } catch (err: any) {
    toast.add({
      title:       t('events.create.error', 'Erreur'),
      description: err ?? 'Une erreur est survenue',
      color:       'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer>
    <div class="flex flex-col gap-8">

      <!-- ── Title ──────────────────────────────────────── -->
      <section>
        <h1 class="text-xl font-semibold text-highlighted">
          {{ t('events.stepper.title.create') }}
        </h1>
      </section>

      <!-- ── Stepper ────────────────────────────────────── -->
      <section class="flex flex-col gap-4">
        <UStepper
          ref="stepper"
          disabled
          :items="steps"
          orientation="horizontal"
          class="w-full"
          :ui="{
            root: 'w-full',
            list: 'w-full justify-between',
            item: 'flex-1',
            separator: 'flex-1',
          }"
        >
          <template #info>         <EventsStepsInfoStep ref="infoStep" />         </template>
          <template #localisation> <EventsStepsLocalisationStep ref="localisationStep" /> </template>
          <template #date>         <EventsStepsDateStep ref="dateStep" />         </template>
        </UStepper>

        <!-- ── Navigation ─────────────────────────────── -->
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
            :trailing-icon="isLastStep ? 'i-lucide-send' : 'i-lucide-arrow-right'"
            @click="handleNext"
          >
            {{ isLastStep
            ? t('events.stepper.nav.submit', 'Publier')
            : t('events.stepper.nav.next', 'Next') }}
          </UButton>
        </div>
      </section>

    </div>
  </UContainer>
</template>
