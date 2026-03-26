<script setup lang="ts">
import { useEventStore } from '~/stores/eventStore'

const props  = defineProps<{ eventId: number }>()
const { t }  = useI18n()
const route  = useRoute()
const toast  = useToast()
const router = useRouter()
const { getEvent, publishEvent, deleteEvent } = useEventStore()

const event          = ref<any>(null)
const loading        = ref(true)
const publishLoading = ref(false)
const deleteOpen     = ref(false)

onMounted(async () => {
  try   { event.value = await getEvent(props.eventId) }
  finally { loading.value = false }
})

const isPublished = computed(() => event.value?.status === 'PUBLISHED')

async function handlePublish() {
  publishLoading.value = true
  try {
    await publishEvent(props.eventId, !isPublished.value)
    event.value = await getEvent(props.eventId)
    toast.add({
      title: isPublished.value
        ? t('events.list.unpublish', 'Événement dépublié')
        : t('events.list.publish',   'Événement publié !'),
      color: 'success',
    })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    publishLoading.value = false
  }
}

async function handleDelete() {
  try {
    await deleteEvent(props.eventId)
    toast.add({ title: t('events.list.deleted', 'Événement supprimé'), color: 'success' })
    await router.push('/events')
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    deleteOpen.value = false
  }
}

const navSections = computed(() => [
  {
    label: t('events.dashboard.section.content', 'Contenu'),
    items: [
      { label: t('events.dashboard.menu.info',         'Informations'),     icon: 'i-lucide-badge-info',       to: `/events/${props.eventId}`               },
      { label: t('events.dashboard.menu.localisation', 'Localisation'),     icon: 'i-lucide-map-pin',          to: `/events/${props.eventId}/localisation`   },
      { label: t('events.dashboard.menu.dates',        'Dates'),            icon: 'i-lucide-calendar-days',    to: `/events/${props.eventId}/dates`          },
      { label: t('events.dashboard.menu.tickets',      'Types de billets'), icon: 'i-lucide-ticket',           to: `/events/${props.eventId}/tickets`        },
      { label: t('events.dashboard.menu.seating',      'Plan de salle'),    icon: 'i-lucide-layout-dashboard', to: `/events/${props.eventId}/seating`        },
    ],
  },
  {
    label: t('events.dashboard.section.sales', 'Ventes'),
    items: [
      { label: t('events.dashboard.menu.stats',  'Statistiques'), icon: 'i-lucide-bar-chart-2',           to: `/events/${props.eventId}/stats`,  badge: null },
      { label: t('events.dashboard.menu.orders', 'Commandes'),    icon: 'i-lucide-shopping-cart',          to: `/events/${props.eventId}/orders`, badge: 3   },
    ],
  },
  {
    label: t('events.dashboard.section.support', 'Support'),
    items: [
      { label: t('events.dashboard.menu.claims', 'Réclamations'), icon: 'i-lucide-message-circle-warning', to: `/events/${props.eventId}/claims`, badge: null },
    ],
  },
])

function isActive(path: string) {
  return route.path === path
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(iso))
}
</script>

<template>
  <aside class="flex flex-col border-r border-default bg-background"
         style="width:220px;flex-shrink:0;overflow:hidden">

    <!-- ── Event header ─────────────────────────────────── -->
    <div class="border-b border-default p-3.5">
      <NuxtLink
        to="/events"
        class="mb-3 flex items-center gap-1.5 text-xs text-muted hover:text-highlighted transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3" />
        {{ t('events.dashboard.back', 'Tous les événements') }}
      </NuxtLink>

      <!-- Cover -->
      <div class="mb-2.5 h-20 w-full overflow-hidden rounded-lg bg-muted/30">
        <img
          v-if="event?.medias?.[0]"
          :src="event.medias[0].thumbnailUrl"
          :alt="event.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <UIcon name="i-lucide-image" class="size-6 text-muted" />
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-2">
        <div class="h-3.5 w-3/4 animate-pulse rounded bg-muted/40" />
        <div class="h-3 w-1/2 animate-pulse rounded bg-muted/30" />
      </div>

      <template v-else-if="event">
        <p class="line-clamp-2 text-xs font-medium text-highlighted leading-snug">
          {{ event.title }}
        </p>
        <p class="mt-0.5 text-xs text-muted">{{ formatDate(event.startAt) }}</p>

        <!-- Status + publish -->
        <div class="mt-2 flex items-center gap-1.5">
          <UBadge
            :color="isPublished ? 'success' : event.status === 'CANCELLED' ? 'error' : 'warning'"
            variant="subtle"
            size="xs"
            class="flex-1 justify-center truncate"
          >
            {{ event.status }}
          </UBadge>
          <UButton
            :icon="isPublished ? 'i-lucide-eye-off' : 'i-lucide-send'"
            size="xs"
            :color="isPublished ? 'neutral' : 'primary'"
            :variant="isPublished ? 'outline' : 'solid'"
            :loading="publishLoading"
            class="flex-1"
            @click="handlePublish"
          >
            {{ isPublished
            ? t('events.list.unpublish', 'Dépublier')
            : t('events.list.publish',   'Publier') }}
          </UButton>
        </div>
      </template>
    </div>

    <!-- ── Navigation ───────────────────────────────────── -->
    <nav class="flex-1 overflow-y-auto p-2.5 space-y-3">
      <div v-for="section in navSections" :key="section.label" class="space-y-0.5">
        <p class="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted"
           style="font-size:10px;letter-spacing:.06em">
          {{ section.label }}
        </p>

        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
          style="font-size:12px"
          :class="isActive(item.to)
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-secondary hover:bg-muted/40 hover:text-highlighted'"
        >
          <UIcon :name="item.icon" class="size-3.5 shrink-0" />
          <span class="flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="flex h-4 min-w-4 items-center justify-center rounded-full
                   bg-error px-1 text-white"
            style="font-size:10px"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <!-- ── Footer ────────────────────────────────────────── -->
    <div class="border-t border-default p-2.5">
      <button
        class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors text-error hover:bg-error/10"
        style="font-size:12px"
        @click="deleteOpen = true"
      >
        <UIcon name="i-lucide-trash-2" class="size-3.5 shrink-0" />
        {{ t('events.dashboard.menu.delete', 'Supprimer l\'événement') }}
      </button>
    </div>
  </aside>

  <!-- Delete confirm -->
  <UModal v-model:open="deleteOpen" :title="t('events.list.delete_confirm_title', 'Supprimer l\'événement')">
    <template #body>
      <p class="text-sm text-muted">
        {{ t('events.list.delete_confirm_body', 'Cette action est irréversible. L\'événement sera définitivement supprimé.') }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="deleteOpen = false">
          {{ t('common.cancel', 'Annuler') }}
        </UButton>
        <UButton color="error" icon="i-lucide-trash-2" @click="handleDelete">
          {{ t('common.delete', 'Supprimer') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
