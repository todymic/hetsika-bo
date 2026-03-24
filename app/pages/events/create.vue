<script setup lang="ts">
import { useEventStore } from '~/stores/eventStore'

const { t }            = useI18n()
const store            = useEventFormStore()
const router           = useRouter()
const toast            = useToast()
const { createEvent }  = useEventStore()
const loading          = ref(false)


async function save(onSuccess: (id: number) => void) {
  loading.value = true
  try {
    const payload = store.buildPayload()
    const form    = new FormData()
    form.append('event', JSON.stringify(payload))
    store.info.files.forEach(file => form.append('files[]', file))

    const response = await createEvent(form)

    if (response.status === 'success' && response.event.id) {
      onSuccess(response.event.id)
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

async function submit() {
  loading.value = true
  try {

    const eventId = store.savedEventId
    if (!eventId) return

    //await createTickets(eventId, store.tickets)

    toast.add({ title: t('events.create.success', 'Événement créé !'), color: 'success' })
    store.reset()
    await router.push('/events')
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

onUnmounted(() => store.reset())
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

      <EventsEventFormStepper
        mode="create"
        :loading="loading"
        @save="save"
        @submit="submit"
      />

    </div>
  </UContainer>
</template>
