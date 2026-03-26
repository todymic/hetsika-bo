<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order, OrderItem } from '~/types/model'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                                       = useI18n()
const route                                       = useRoute()
const toast                                       = useToast()
const { getEventOrders, finalizeOrder }           = useEventStore()
const eventId                                     = Number(route.params.id)

const pending         = ref(true)
const orders          = ref<Order[]>([])
const selectedOrder   = ref<Order | null>(null)
const detailOpen      = ref(false)
const finalizeLoading = ref(false)

onMounted(async () => {
  try   { orders.value = await getEventOrders(eventId) }
  finally { pending.value = false }
})

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  PAID:      { label: t('orders.status.paid',      'Payé'),       color: 'success' },
  PENDING:   { label: t('orders.status.pending',   'En attente'), color: 'warning' },
  ERROR:     { label: t('orders.status.error',     'Erreur'),     color: 'error'   },
  CANCELLED: { label: t('orders.status.cancelled', 'Annulé'),     color: 'neutral' },
  REFUNDED:  { label: t('orders.status.refunded',  'Remboursé'),  color: 'info'    },
}

const columns: ColumnDef<Order>[] = [
  { id: 'id',        accessorKey: 'id',         header: '#'                                          },
  { id: 'customer',  accessorKey: 'customer',   header: t('orders.col_customer', 'Client')          },
  { id: 'contact',   accessorKey: 'contact',    header: t('orders.col_contact',  'Contact')         },
  { id: 'createdAt', accessorKey: 'createdAt',  header: t('orders.col_date',     'Date')            },
  { id: 'total',     accessorKey: 'totalCents', header: t('orders.col_total',    'Montant')         },
  { id: 'status',    accessorKey: 'status',     header: t('orders.col_status',   'Statut')          },
  { id: 'actions',   header: ''                                                                       },
]

function formatCents(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr', { style: 'currency', currency }).format(cents / 100)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function openDetail(order: Order) {
  selectedOrder.value = order
  detailOpen.value    = true
}

async function handleFinalize(order: Order) {
  finalizeLoading.value = true
  try {
    await finalizeOrder(order.id)
    toast.add({ title: t('orders.finalize_success', 'Billets générés avec succès'), color: 'success' })
    orders.value = await getEventOrders(eventId)
    if (selectedOrder.value?.id === order.id) {
      selectedOrder.value = orders.value.find(o => o.id === order.id) ?? null
    }
  } catch {
    toast.add({ title: t('orders.finalize_error', 'Erreur lors de la génération'), color: 'error' })
  } finally {
    finalizeLoading.value = false
  }
}

// Stats rapides
const errorCount = computed(() => orders.value.filter(o => o.status === 'ERROR').length)
const paidCount  = computed(() => orders.value.filter(o => o.status === 'PAID').length)
</script>

<template>
  <div class="p-6 space-y-6">

    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-highlighted">
        {{ t('events.dashboard.menu.orders', 'Commandes') }}
      </h1>
      <div class="flex items-center gap-2">
        <UBadge v-if="errorCount" color="error" variant="subtle">
          {{ errorCount }} {{ t('orders.error_badge', 'en erreur') }}
        </UBadge>
        <UBadge color="success" variant="subtle">
          {{ paidCount }} {{ t('orders.paid_badge', 'payées') }}
        </UBadge>
      </div>
    </div>

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <UCard v-else-if="orders.length" class="overflow-hidden p-0">
      <div class="overflow-x-auto">
        <UTable :data="orders" :columns="columns" class="min-w-[640px]">

          <template #customer-cell="{ row }">
            <p class="text-sm font-medium text-highlighted">
              {{ (row.original as Order).customer.firstName }}
              {{ (row.original as Order).customer.lastName }}
            </p>
          </template>

          <template #contact-cell="{ row }">
            <div class="space-y-0.5">
              <p class="text-xs text-muted">{{ (row.original as Order).customer.email }}</p>
              <p v-if="(row.original as Order).customer.phone" class="text-xs text-muted">
                {{ (row.original as Order).customer.phone }}
              </p>
            </div>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm text-muted">{{ formatDate((row.original as Order).createdAt) }}</span>
          </template>

          <template #total-cell="{ row }">
            <span class="text-sm font-medium">
              {{ formatCents((row.original as Order).totalCents, (row.original as Order).currency) }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :color="statusConfig[(row.original as Order).status]?.color ?? 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ statusConfig[(row.original as Order).status]?.label ?? (row.original as Order).status }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
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

    <UCard v-else class="p-8 text-center">
      <UIcon name="i-lucide-shopping-cart" class="size-8 text-muted mx-auto" />
      <p class="mt-2 text-sm text-muted">{{ t('orders.empty', 'Aucune commande') }}</p>
    </UCard>

  </div>

  <!-- ── Order detail modal ──────────────────────────────── -->
  <UModal
    v-model:open="detailOpen"
    :title="`${t('orders.detail_title', 'Commande')} #${selectedOrder?.id}`"
    size="lg"
  >
    <template #body>
      <div v-if="selectedOrder" class="space-y-4">

        <!-- Customer -->
        <div class="rounded-lg border border-default bg-muted/20 px-4 py-3 space-y-1">
          <p class="text-sm font-medium text-highlighted">
            {{ selectedOrder.customer.firstName }} {{ selectedOrder.customer.lastName }}
          </p>
          <p class="text-xs text-muted">{{ selectedOrder.customer.email }}</p>
          <p v-if="selectedOrder.customer.phone" class="text-xs text-muted">
            {{ selectedOrder.customer.phone }}
          </p>
        </div>

        <!-- Meta -->
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
                  {{ t('orders.item_qty', 'Qté') }} : {{ item.quantity }}
                  <span v-if="item.ticketType.status === 'SEAT_ASSIGNED'" class="ml-2 text-success">
                    ✓ Siège assigné
                  </span>
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

        <!-- Finalize -->
        <UButton
          v-if="selectedOrder.status === 'ERROR'"
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
