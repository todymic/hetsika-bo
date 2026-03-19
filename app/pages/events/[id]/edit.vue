<script setup lang="ts">
import { useEventStore } from '~/stores/eventStore'

const { t }                     = useI18n()
const route                     = useRoute()
const store                     = useEventFormStore()
const router                    = useRouter()
const toast                     = useToast()
const { getEvent, updateEvent } = useEventStore()
const loading                   = ref(false)

const eventId = Number(route.params.id)

const pending = ref(true)

onMounted(async () => {
  try {
    const data = await getEvent(eventId)
    store.loadEvent(data)
  } finally {
    pending.value = false
  }
})

onUnmounted(() => {
  store.reset()
  store.resetEditMode()
})


async function submit() {
  loading.value = true
  try {
    const payload = store.buildPayload()
    const form    = new FormData()
    form.append('event', JSON.stringify(payload))
    store.info.files.forEach(file => form.append('files[]', file))

    await updateEvent(eventId, form)

    toast.add({ title: t('events.edit.success', 'Événement mis à jour !'), color: 'success' })
    store.reset()
    store.resetEditMode()
    await router.push('/events')
  } catch (err: any) {
    toast.add({
      title:       t('events.edit.error', 'Erreur'),
      description: err?.data?.message ?? 'Une erreur est survenue',
      color:       'error',
    })
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (!route.path.includes(String(eventId))) {
    store.reset()
    store.resetEditMode()
  }
})
</script>

<template>
  <UContainer>
    <div class="flex flex-col gap-8">

      <!-- ── Title ──────────────────────────────────────── -->
      <section class="flex items-center gap-3">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="sm" @click="router.back()" />
        <h1 class="text-xl font-semibold text-highlighted">
          {{ t('events.stepper.title.edit', 'Modifier l\'événement') }}
        </h1>
      </section>

      <!-- ── Loading ────────────────────────────────────────── -->
      <template v-if="pending">
        <div class="flex items-center justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
        </div>
      </template>

      <EventsEventFormStepper
        v-else
        mode="edit"
        :loading="loading"
        @submit="submit"
      />

    </div>
  </UContainer>
</template>
