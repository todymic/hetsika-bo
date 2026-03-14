<script setup lang="ts">
import type { Event, EventStatus } from '~/types/model'
import { useEventStore } from '~/stores/eventStore'
import {useDevice} from "~/composables/useDevice";

const { t }      = useI18n()
const toast      = useToast()
const eventStore = useEventStore()
const { isDesktop, isMobile } = useDevice()

// ─────────────────────────────────────
// Infinite scroll — cursor pagination
// ─────────────────────────────────────
interface PaginatedResponse {
  items:       Event[]
  hasNextPage: boolean
  nextCursor:  number | null
}

const PAGE_SIZE   = 10
const events      = ref<Event[]>([])
const pending     = ref(false)
const loadingMore = ref(false)
const nextCursor  = ref<number>(0)
const hasMore     = ref(false)

const sentinel = ref<HTMLElement | null>(null)
const initEvents = [];

const buildParams = () => ({
  term: search.value || undefined,
  status: statusFilter.value !== 'ALL' ? statusFilter.value : undefined,
})

// Initial fetch — replaces the list
const fetchEvents = async (filterParam?: { search?: string, status?: EventStatus }) => {
  pending.value = true
  try {
    const res: PaginatedResponse = await eventStore.getEvents(0, PAGE_SIZE, filterParam)
    events.value     = res.items
    hasMore.value    = res.hasNextPage
    nextCursor.value = res.nextCursor ?? 0
  } catch (e: any) {
    toast.add({ title: t('common.error'), description: e.data?.message, color: 'error' })
  } finally {
    pending.value = false
    await nextTick()
    setupObserver()
  }
}

// Load more — appends to list
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value || pending.value) return
  loadingMore.value = true
  try {
    const res: PaginatedResponse = await eventStore.getEvents(nextCursor.value, PAGE_SIZE, buildParams())
    events.value     = [...events.value, ...res.items]
    hasMore.value    = res.hasNextPage
    nextCursor.value = res.nextCursor ?? 0
  } catch (e: any) {
    toast.add({ title: t('common.error'), description: e.data?.message, color: 'error' })
  } finally {
    loadingMore.value = false
  }
}

// IntersectionObserver sur le sentinel
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  observer?.disconnect()
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting && hasMore.value) loadMore() },
    { rootMargin: '100px' }
  )
  observer.observe(sentinel.value)
}

watch(sentinel, (el) => { if (el) setupObserver() })
onUnmounted(() => observer?.disconnect())

// ─────────────────────────────────────
// Filters — reset on change
// ─────────────────────────────────────
const search       = ref('')
const statusFilter = ref<EventStatus | 'ALL'>('ALL')


const resetAndFetch = async () => {
  events.value     = []
  hasMore.value    = false
  nextCursor.value = 0

  const params = buildParams()

  await fetchEvents(params)
  await fetchGlobalStats()
}

let searchTimer: ReturnType<typeof setTimeout>
watch(search, resetAndFetch)
watch(statusFilter, resetAndFetch)

onMounted(fetchEvents)

// ─────────────────────────────────────
// Statistics
// ─────────────────────────────────────
const statsData = ref({
  total: 0,
  published: 0,
  drafts: 0,
  cancelled: 0 })

const fetchGlobalStats = async () => {
  statsData.value = await eventStore.getGlobalStats()
}

onMounted(async () => { try { await fetchGlobalStats() } catch {} })

const statCards = computed(() => [
  { label: t('events.stats.total'),     value: statsData.value.total,     icon: 'i-lucide-calendar-days', color: 'text-primary',     bg: 'bg-primary-50 dark:bg-primary-900/20' },
  { label: t('events.stats.published'), value: statsData.value.published,  icon: 'i-lucide-circle-check',  color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/20' },
  { label: t('events.stats.drafts'),    value: statsData.value.drafts,     icon: 'i-lucide-file-pen-line', color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/20' },
  { label: t('events.stats.cancelled'), value: statsData.value.cancelled,  icon: 'i-lucide-circle-x',      color: 'text-error-500',   bg: 'bg-error-50 dark:bg-error-900/20' },
])

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────
const statusOptions = [
  { label: t('events.status.all'),       value: 'ALL' },
  { label: t('events.status.published'), value: 'PUBLISHED' },
  { label: t('events.status.draft'),     value: 'DRAFT' },
  { label: t('events.status.cancelled'), value: 'CANCELLED' },
]

const statusColor = (s: EventStatus): 'success' | 'warning' | 'error' | 'neutral' =>
  ({ PUBLISHED: 'success', DRAFT: 'warning', CANCELLED: 'error' } as any)[s] ?? 'neutral'
const statusLabel = (s: EventStatus) => t(`events.status.${s.toLowerCase()}`)
const formatDate  = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
const getCover = (event: Event) => event.medias?.find(m => m.isCover)?.thumbnailUrl ?? null

// ─────────────────────────────────────
// Delete
// ─────────────────────────────────────
const deleteModal = ref(false)
const deletingId  = ref<number | null>(null)
const deleting    = ref(false)

const confirmDelete = (id: number) => { deletingId.value = id; deleteModal.value = true }

const doDelete = async () => {
  if (!deletingId.value) return
  deleting.value = true
  try {
    eventStore.deleteEvent(deletingId.value)
      .then(async () => {
        toast.add({ title: t('events.list.deleted'), color: 'success' })
        events.value = events.value.filter(e => e.id !== deletingId.value)
        //total.value--
        deleteModal.value = false
        await fetchGlobalStats();
      })


  } catch (e: any) {
    toast.add({ title: t('common.error'), description: e.data?.message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

// ─────────────────────────────────────
// Toggle status
function updateEventStatus(id: number, next: "DRAFT" | "PUBLISHED" | "CANCELLED") {
  try {
    eventStore.updateStatus(id, next)
      .then(async () => {
        await fetchGlobalStats();
        const idx = events.value.findIndex(e => e.id === id)
        if (idx !== -1) events.value[idx] = {...events.value[idx], status: next}
        toast.add({title: t('events.list.status_updated'), color: 'success'})
      })

  } catch (e: any) {
    toast.add({title: t('common.error'), description: e.data?.message, color: 'error'})
  }
}

// ─────────────────────────────────────
const toggleStatus = async (event: Event) => {
  const next: EventStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  updateEventStatus(Number(event.id), next);
}

const cancelEvent = async (id: number) => {
  updateEventStatus(id, 'CANCELLED');
}
</script>

<template>
  <div class="flex flex-col gap-8">

    <!-- ── Stats ── -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bar-chart-2" class="size-4 text-muted" />
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wider">{{ t('events.sections.stats') }}</h2>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UCard v-for="stat in statCards" :key="stat.label" :ui="{ body: 'p-4' }">
          <div class="flex items-center gap-3">
            <div :class="['p-2.5 rounded-xl flex-shrink-0', stat.bg]">
              <UIcon :name="stat.icon" :class="['size-5', stat.color]" />
            </div>
            <div>
              <p :class="['text-2xl font-bold leading-none', stat.color]">{{ stat.value }}</p>
              <p class="text-xs text-muted mt-1">{{ stat.label }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <!-- ── Listing ── -->
    <section class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-list" class="size-4 text-muted" />
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wider">{{ t('events.sections.listing') }}</h2>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex gap-2 flex-1 w-full sm:max-w-md">
          <UInput v-model="search" :placeholder="t('events.list.search')" icon="i-lucide-search" class="flex-1" />
          <USelectMenu
            v-model="statusFilter"
            :items="statusOptions"
            label-key="label"
            value-key="value"
            class="w-40"
          />
        </div>
        <UButton icon="i-lucide-plus" :label="t('events.list.add')" to="/events/new" />
      </div>

      <!-- Skeletons -->
      <div v-if="pending" class="flex flex-col gap-3">
        <UCard v-for="n in 4" :key="n" :ui="{ body: 'p-0' }">
          <div class="flex gap-4 p-4">
            <USkeleton class="w-36 h-28 rounded-lg flex-shrink-0" />
            <div class="flex flex-col gap-2 flex-1 py-1">
              <USkeleton class="h-5 w-2/3" />
              <USkeleton class="h-4 w-1/3" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty -->
      <UEmpty
        v-else-if="!events.length"
        icon="i-lucide-calendar-x"
        :title="search ? t('events.list.no_results') : t('events.list.empty')"
        :description="search ? t('events.list.no_results_hint') : t('events.list.empty_hint')"
      >
        <template v-if="!search" #actions>
          <UButton icon="i-lucide-plus" :label="t('events.list.add')" to="/events/new" />
        </template>
      </UEmpty>

      <!-- Cards -->
      <div v-else class="flex flex-col gap-3">
        <UCard
          v-for="event in events"
          :key="event.id"
          :ui="{ body: 'p-0' }"
          class="overflow-hidden hover:ring-1 hover:bg-gray-500/30 hover:ring-gray-500/30 transition-all"
        >
          <div class="flex">
            <!-- Cover -->
            <div class="w-36 sm:w-48 flex-shrink-0 relative overflow-hidden bg-muted min-h-[7rem]">
              <img
                v-if="getCover(event)"
                :src="getCover(event)!"
                :alt="event.title"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-lucide-image" class="size-8 text-muted-foreground/30" />
              </div>
              <div class="absolute top-2 left-2">
                <UBadge :color="statusColor(event.status)" variant="solid" size="md">
                  {{ statusLabel(event.status) }}
                </UBadge>
              </div>
            </div>

            <!-- Body -->
            <div class="flex flex-col sm:flex-row flex-1 min-w-0 p-4 gap-4">
              <div class="flex flex-col gap-1.5 flex-1 min-w-0">
                <h3 class="font-semibold text-base truncate">{{ event.title }}</h3>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="size-3.5 flex-shrink-0" />
                    {{ formatDate(event.startAt) }}
                  </span>
                  <span v-if="event.address" class="flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" class="size-3.5 flex-shrink-0" />
                    {{ event.address.city }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-users" class="size-3.5 flex-shrink-0" />
                    {{ t('events.list.participants', { count: 0 }) }}
                  </span>
                </div>
                <div v-if="event.categories?.length" class="flex flex-wrap gap-1 mt-0.5">
                  <UBadge v-for="cat in event.categories.slice(0, 3)" :key="cat.id" variant="subtle" color="neutral" size="sm">
                    {{ cat.name }}
                  </UBadge>
                  <UBadge v-if="event.categories.length > 3" variant="subtle" color="neutral" size="md">
                    +{{ event.categories.length - 3 }}
                  </UBadge>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                <div class="flex items-center gap-1 md:gap-2">
                  <UTooltip :text="t('events.list.edit')">
                    <UButton loading-auto v-if="isDesktop" size="md" variant="solid" :label="t('common.edit')" color="warning" :to="`/events/${event.id}/edit`"></UButton>
                    <UButton v-else loading-auto icon="i-lucide-pencil" size="md" variant="ghost" color="neutral" :to="`/events/${event.id}/edit`" />
                  </UTooltip>
                  <UTooltip v-if="event.status !== 'CANCELLED'" :text="t('common.cancel')">
                    <UButton v-if="isDesktop"
                             size="md"
                             :label="t('common.cancel')"
                             color="info"
                             variant="solid"
                             loading-auto
                             @click="cancelEvent(Number(event.id))"></UButton>
                    <UButton v-else
                             icon="i-lucide:octagon-pause"
                             size="md"
                             loading-auto
                             variant="ghost"
                             color="neutral" @click="cancelEvent(Number(event.id))" />
                  </UTooltip>
                  <UTooltip :text="t('events.list.delete')">
                    <UButton v-if="isDesktop" loading-auto size="md" color="error" variant="solid" :label="t('common.delete')" @click="confirmDelete(Number(event.id))" />
                    <UButton v-else loading-auto icon="i-lucide-trash-2" size="md" variant="ghost" color="error" @click="confirmDelete(Number(event.id))" />
                  </UTooltip>
                </div>
                <UButton
                  size="xs"
                  :color="event.status === 'PUBLISHED' ? 'neutral' : 'primary'"
                  :variant="event.status === 'PUBLISHED' ? 'outline' : 'solid'"
                  :icon="event.status === 'PUBLISHED' ? 'i-lucide-eye-off' : 'i-lucide-send'"
                  :label="event.status === 'PUBLISHED' ? t('events.list.unpublish') : t('events.list.publish')"
                  @click="toggleStatus(event)"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- ── Sentinel + load more indicator ── -->
        <div ref="sentinel" class="flex flex-col items-center gap-3 py-4">

          <!-- Chargement "load more" en cours -->
          <template v-if="loadingMore">
            <div class="flex items-center gap-2 text-sm text-muted py-2">
              <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
              <span>{{ t('events.list.loading_more') }}</span>
            </div>
            <UCard v-for="n in 3" :key="n" :ui="{ body: 'p-0' }" class="w-full">
              <div class="flex gap-4 p-4">
                <USkeleton class="w-36 h-28 rounded-lg flex-shrink-0" />
                <div class="flex flex-col gap-2 flex-1 py-1">
                  <USkeleton class="h-5 w-2/3" />
                  <USkeleton class="h-4 w-1/3" />
                  <USkeleton class="h-4 w-1/2" />
                </div>
              </div>
            </UCard>
          </template>

          <!-- Invitation à scroller -->
          <template v-else-if="hasMore">
            <div class="flex items-center gap-2 text-sm text-muted select-none">
              <UIcon name="i-lucide-chevrons-down" class="size-4 animate-bounce" />
              <span>{{ t('events.list.see_more') }}</span>
              <UIcon name="i-lucide-chevrons-down" class="size-4 animate-bounce" />
            </div>
          </template>

          <!-- Fin de liste -->
          <template v-else>
            <div class="flex flex-col items-center gap-2 w-full">
              <USeparator class="w-full" />
              <p class="text-xs text-muted pt-1">
                {{ t('events.list.all_loaded', { count: events.length }) }}
              </p>
            </div>
          </template>

        </div>
      </div>
    </section>

    <!-- ── Delete modal ── -->
    <UModal v-model:open="deleteModal" :title="t('events.list.delete_confirm_title')">
      <template #body>
        <p class="text-sm text-muted">{{ t('events.list.delete_confirm_body') }}</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton :label="t('common.cancel')" variant="ghost" color="neutral" @click="deleteModal = false" />
          <UButton :label="t('common.delete')" color="error" icon="i-lucide-trash-2" :loading="deleting" @click="doDelete" />
        </div>
      </template>
    </UModal>

  </div>
</template>
