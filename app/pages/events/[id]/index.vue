<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order, OrderItem, EventSalesStats } from '~/types/model'
import { useEventStore } from '~/stores/eventStore'

const { t }     = useI18n()
const route     = useRoute()
const router    = useRouter()
const toast     = useToast()
const { getEvent, getEventStats, getEventOrders, finalizeOrder } = useEventStore()

const eventId = Number(route.params.id)

// ── Data fetching ──────────────────────────────────────────
const pending      = ref(true)
const event        = ref()
const stats        = ref<EventSalesStats | null>(null)
const orders       = ref<Order[]>([])

onMounted(async () => {
  try {
    ;[event.value, stats.value, orders.value] = await Promise.all([
      getEvent(eventId),
      getEventStats(eventId),
      getEventOrders(eventId),
    ])
  } finally {
    pending.value = false
  }
})

// ── Status config ──────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  PAID:      { label: t('orders.status.paid',      'Payé'),      color: 'success' },
  PENDING:   { label: t('orders.status.pending',   'En attente'), color: 'warning' },
  ERROR:     { label: t('orders.status.error',     'Erreur'),    color: 'error'   },
  CANCELLED: { label: t('orders.status.cancelled', 'Annulé'),    color: 'neutral' },
  REFUNDED:  { label: t('orders.status.refunded',  'Remboursé'), color: 'info'    },
}

// ── Columns ────────────────────────────────────────────────
const columns: ColumnDef<Order>[] = [
  { id: 'id',        accessorKey: 'id',        header: t('orders.col_id',      '#')          },
  { id: 'customer',  accessorKey: 'customer',  header: t('orders.col_customer', 'Client')    },
  { id: 'contact',   accessorKey: 'contact',   header: t('orders.col_contact',  'Contact')   },
  { id: 'createdAt', accessorKey: 'createdAt', header: t('orders.col_date',     'Date')      },
  { id: 'total',     accessorKey: 'totalCents', header: t('orders.col_total',   'Montant')   },
  { id: 'status',    accessorKey: 'status',    header: t('orders.col_status',   'Statut')    },
  { id: 'actions',   header: ''                                                               },
]

// ── Order detail modal ─────────────────────────────────────
const selectedOrder   = ref<Order | null>(null)
const detailOpen      = ref(false)
const finalizeLoading = ref(false)

function openDetail(order: Order) {
  selectedOrder.value = order
  detailOpen.value    = true
}

async function handleFinalize(order: Order) {
  finalizeLoading.value = true
  try {
    await finalizeOrder(order.id)
    toast.add({ title: t('orders.finalize_success', 'Billets générés avec succès'), color: 'success' })
    // Refresh orders
    orders.value = await getEventOrders(eventId)
  } catch {
    toast.add({ title: t('orders.finalize_error', 'Erreur lors de la génération'), color: 'error' })
  } finally {
    finalizeLoading.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────
function formatCents(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr', { style: 'currency', currency }).format(cents / 100)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

// ── Pie chart data ─────────────────────────────────────────
const chartData = computed(() => {
  if (!stats.value) return null
  return {
    labels:   stats.value.byTicketType.map(b => b.ticketType.name),
    datasets: [{
      data:            stats.value.byTicketType.map(b => b.sold),
      backgroundColor: ['#1D9E75', '#7F77DD', '#D85A30', '#378ADD', '#BA7517', '#D4537E'],
      borderWidth:     0,
    }],
  }
})

const chartOptions = {
  responsive:         true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
  },
}
</script>

<template>
  <UContainer>
    <div class="flex flex-col gap-8 pb-12">

      <!-- ── Header ─────────────────────────────────────── -->
      <section class="flex items-center gap-3">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="sm" @click="router.back()" />
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-xl font-semibold text-highlighted">
            {{ event?.title ?? '…' }}
          </h1>
          <p v-if="event?.startAt" class="mt-0.5 text-sm text-muted">
            {{ formatDate(event.startAt) }}
          </p>
        </div>
        <UButton
          icon="i-lucide-pencil"
          variant="outline"
          size="sm"
          :to="`/events/${eventId}/edit`"
        >
          {{ t('common.edit', 'Modifier') }}
        </UButton>
      </section>

      <!-- ── Loading ────────────────────────────────────── -->
      <template v-if="pending">
        <div class="flex items-center justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
        </div>
      </template>

      <template v-else>

        <!-- ── Sales stats ──────────────────────────────── -->
        <section class="space-y-4">
          <h2 class="text-base font-medium text-highlighted">
            {{ t('events.view.stats_title', 'Statistiques de vente') }}
          </h2>

          <!-- KPI cards -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <UCard class="p-4">
              <p class="text-xs text-muted">{{ t('events.view.total_participants', 'Participants') }}</p>
              <p class="mt-1 text-2xl font-semibold text-highlighted">
                {{ stats?.totalParticipants ?? 0 }}
              </p>
            </UCard>

            <UCard class="p-4">
              <p class="text-xs text-muted">{{ t('events.view.total_revenue', 'Recettes') }}</p>
              <p class="mt-1 text-2xl font-semibold text-highlighted">
                {{ stats ? formatCents(stats.totalAmountCents) : '—' }}
              </p>
            </UCard>

            <UCard class="col-span-2 p-4">
              <p class="text-xs text-muted mb-2">{{ t('events.view.by_ticket_type', 'Par type de billet') }}</p>
              <div class="space-y-1.5">
                <div
                  v-for="b in stats?.byTicketType"
                  :key="b.ticketType.id"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm text-highlighted">{{ b.ticketType.name }}</span>
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-muted">{{ b.sold }} vendus</span>
                    <span class="text-sm font-medium text-highlighted">
                      {{ formatCents(b.revenue) }}
                    </span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Pie chart -->
          <UCard v-if="chartData" class="p-4">
            <p class="text-xs font-medium text-muted mb-4">
              {{ t('events.view.chart_title', 'Répartition des billets vendus') }}
            </p>
            <div class="h-64">
              <canvas id="pie-chart" />
            </div>
          </UCard>
        </section>

        <!-- ── Orders ────────────────────────────────────── -->
        <section class="space-y-4">
          <h2 class="text-base font-medium text-highlighted">
            {{ t('events.view.orders_title', 'Commandes') }}
          </h2>

          <UCard class="overflow-hidden p-0">
            <div class="overflow-x-auto">
              <UTable :data="orders" :columns="columns" class="min-w-[640px]">

                <!-- Customer name -->
                <template #customer-cell="{ row }">
                  <div>
                    <p class="text-sm font-medium text-highlighted">
                      {{ (row.original as Order).customer.firstName }}
                      {{ (row.original as Order).customer.lastName }}
                    </p>
                  </div>
                </template>

                <!-- Contact -->
                <template #contact-cell="{ row }">
                  <div class="space-y-0.5">
                    <p class="text-xs text-muted">{{ (row.original as Order).customer.email }}</p>
                    <p v-if="(row.original as Order).customer.phone" class="text-xs text-muted">
                      {{ (row.original as Order).customer.phone }}
                    </p>
                  </div>
                </template>

                <!-- Date -->
                <template #createdAt-cell="{ row }">
                  <span class="text-sm text-muted">
                    {{ formatDate((row.original as Order).createdAt) }}
                  </span>
                </template>

                <!-- Total -->
                <template #total-cell="{ row }">
                  <span class="text-sm font-medium">
                    {{ formatCents(
                    (row.original as Order).totalCents,
                    (row.original as Order).currency
                  ) }}
                  </span>
                </template>

                <!-- Status -->
                <template #status-cell="{ row }">
                  <UBadge
                    :color="statusConfig[(row.original as Order).status]?.color ?? 'neutral'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ statusConfig[(row.original as Order).status]?.label ?? (row.original as Order).status }}
                  </UBadge>
                </template>

                <!-- Actions -->
                <template #actions-cell="{ row }">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Finalize — only for ERROR status -->
                    <UButton
                      v-if="(row.original as Order).status === 'ERROR'"
                      variant="soft"
                      size="xs"
                      color="warning"
                      icon="i-lucide-zap"
                      :loading="finalizeLoading"
                      @click="handleFinalize(row.original as Order)"
                    >
                      {{ t('orders.finalize', 'Finaliser') }}
                    </UButton>

                    <!-- Detail -->
                    <UButton
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-eye"
                      color="neutral"
                      @click="openDetail(row.original as Order)"
                    />
                  </div>
                </template>

              </UTable>
            </div>
          </UCard>
        </section>

      </template>
    </div>
  </UContainer>

  <!-- ── Order detail modal ─────────────────────────────── -->
  <UModal
    v-model:open="detailOpen"
    :title="t('orders.detail_title', 'Détail de la commande') + ` #${selectedOrder?.id}`"
    size="lg"
  >
    <template #body>
      <div v-if="selectedOrder" class="space-y-4">

        <!-- Customer info -->
        <div class="rounded-lg border border-default bg-muted/20 px-4 py-3 space-y-1">
          <p class="text-sm font-medium text-highlighted">
            {{ selectedOrder.customer.firstName }} {{ selectedOrder.customer.lastName }}
          </p>
          <p class="text-xs text-muted">{{ selectedOrder.customer.email }}</p>
          <p v-if="selectedOrder.customer.phone" class="text-xs text-muted">
            {{ selectedOrder.customer.phone }}
          </p>
        </div>

        <!-- Order meta -->
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-lg border border-default bg-muted/20 px-3 py-2 text-center">
            <p class="text-xs text-muted">{{ t('orders.col_date', 'Date') }}</p>
            <p class="text-xs font-medium text-highlighted mt-0.5">
              {{ formatDate(selectedOrder.createdAt) }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-muted/20 px-3 py-2 text-center">
            <p class="text-xs text-muted">{{ t('orders.col_total', 'Montant') }}</p>
            <p class="text-sm font-semibold text-highlighted mt-0.5">
              {{ formatCents(selectedOrder.totalCents, selectedOrder.currency) }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-muted/20 px-3 py-2 text-center">
            <p class="text-xs text-muted">{{ t('orders.col_status', 'Statut') }}</p>
            <div class="flex justify-center mt-1">
              <UBadge
                :color="statusConfig[selectedOrder.status]?.color ?? 'neutral'"
                variant="subtle"
                size="sm"
              >
                {{ statusConfig[selectedOrder.status]?.label ?? selectedOrder.status }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div>
          <p class="text-xs font-medium text-muted mb-2">
            {{ t('orders.items_title', 'Billets commandés') }}
          </p>
          <ul class="space-y-2">
            <li
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-default px-3 py-2"
            >
              <div>
                <p class="text-sm font-medium text-highlighted">{{ item.ticketType.name }}</p>
                <p class="text-xs text-muted">
                  {{ t('orders.item_qty', 'Quantité') }} : {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-highlighted">
                  {{ formatCents(item.unitPriceCents * item.quantity, item.currency) }}
                </p>
                <p class="text-xs text-muted">
                  {{ formatCents(item.unitPriceCents, item.currency) }} / unité
                </p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Finalize button (if error) -->
        <div v-if="selectedOrder.status === 'ERROR'">
          <UButton
            color="warning"
            variant="soft"
            icon="i-lucide-zap"
            class="w-full"
            :loading="finalizeLoading"
            @click="handleFinalize(selectedOrder)"
          >
            {{ t('orders.finalize', 'Finaliser et envoyer les billets') }}
          </UButton>
        </div>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton variant="outline" color="neutral" @click="detailOpen = false">
          {{ t('common.cancel', 'Fermer') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
