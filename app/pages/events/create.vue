<script setup lang="ts">
import type { StepperItem } from '#ui/components/Stepper.vue'
import {useEventStore} from "~/stores/eventStore";

const { t }   = useI18n()
const store   = useEventFormStore()
const router  = useRouter()
const toast   = useToast()
const {createEvent} = useEventStore()

const steps = ref<StepperItem[]>([
  { title: t('events.stepper.steps.info'),         icon: 'i-lucide-badge-info',    slot: 'info'         as const },
  { title: t('events.stepper.steps.localisation'),  icon: 'i-lucide-map-pin',       slot: 'localisation' as const },
  { title: t('events.stepper.steps.dates'),         icon: 'i-lucide-calendar-days', slot: 'date'         as const },
])

const stepper: any    = useTemplateRef('stepper')
const loading     = ref(false)
const hasPrev     = computed<boolean>(() => stepper.value?.hasPrev ?? false)
const hasNext     = computed<boolean>(() => stepper.value?.hasNext ?? false)
const isLastStep  = computed<boolean>(() => !hasNext.value)

// ── Submit ─────────────────────────────────────────────────
async function submit() {
  loading.value = true
  try {
    const payload = store.buildPayload()

    const form = new FormData()
    form.append('event', JSON.stringify(payload))
    store.info.files.forEach(file => form.append('files[]', file))

    const response = await createEvent(form)

    if(response.status === 'success') {
      toast.add({ title: t('events.create.success', 'Événement créé !'), color: 'success' })
      store.reset()
      router.push('/events')
    }
  } catch (err: any) {
    toast.add({
      title:       t('events.create.error', 'Erreur'),
      description: err?.data?.message ?? 'Une erreur est survenue',
      color:       'error',
    })
  } finally {
    loading.value = false
  }
}


const infoStep         = useTemplateRef('infoStep')
const localisationStep = useTemplateRef('localisationStep')
const dateStep         = useTemplateRef('dateStep')

const stepRefs = computed(() => [
  infoStep.value,
  localisationStep.value,
  dateStep.value,
])

const currentIndex = computed<number>(() => stepper.value?.value ?? 0)

async function handleNext() {
  // Validate current step
  const current = stepRefs.value[currentIndex.value]
  const valid   = await current?.validate()
  console.log(stepper.value?.value, valid)
  if (!valid) return
  console.log(current, valid)
  if (isLastStep.value) submit()
  else stepper.value?.next()
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
            @click="stepper?.prev()"
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
