<script setup lang="ts">
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js'
import type { EventSalesStats } from '~/types/model'
import { useEventStore } from '~/stores/eventStore'

Chart.register(ArcElement, Tooltip, Legend, PieController)

definePageMeta({ layout: 'event-dashboard' })

const { t }              = useI18n()
const route              = useRoute()
const { getEventStats }  = useEventStore()
const eventId            = Number(route.params.id)

const pending = ref(true)
const stats   = ref<EventSalesStats | null>(null)

let chartInstance: Chart | null = null

function formatCents(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr', { style: 'currency', currency }).format(cents / 100)
}

const chartData = computed(() => {
  if (!stats.value?.byTicketType.length) return null
  return {
    labels:   stats.value.byTicketType.map(b => b.ticketType.name),
    datasets: [{
      data:            stats.value.byTicketType.map(b => b.sold),
      backgroundColor: ['#1D9E75', '#7F77DD', '#D85A30', '#378ADD', '#BA7517', '#D4537E'],
      borderWidth:     0,
    }],
  }
})

watch(chartData, (data) => {
  if (!data) return
  nextTick(() => {
    const canvas = document.getElementById('pie-chart') as HTMLCanvasElement
    if (!canvas) return
    if (chartInstance) chartInstance.destroy()
    chartInstance = new Chart(canvas, {
      type: 'pie',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    })
  })
})

onMounted(async () => {
  try   { stats.value = await getEventStats(eventId) }
  finally { pending.value = false }
})

onUnmounted(() => chartInstance?.destroy())
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-lg font-semibold text-highlighted">
      {{ t('events.dashboard.menu.stats', 'Statistiques de vente') }}
    </h1>

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <template v-else-if="stats">

      <!-- KPI cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UCard class="p-4">
          <p class="text-xs text-muted">{{ t('events.view.total_participants', 'Participants') }}</p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">{{ stats.totalParticipants }}</p>
        </UCard>

        <UCard class="p-4">
          <p class="text-xs text-muted">{{ t('events.view.total_revenue', 'Recettes') }}</p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            {{ formatCents(stats.totalAmountCents) }}
          </p>
        </UCard>

        <UCard class="p-4">
          <p class="text-xs text-muted">{{ t('events.view.total_orders', 'Commandes') }}</p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            {{ stats.byTicketType.reduce((acc, b) => acc + b.sold, 0) }}
          </p>
        </UCard>

        <UCard class="p-4">
          <p class="text-xs text-muted">{{ t('events.view.avg_order', 'Panier moyen') }}</p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            {{ stats.totalParticipants > 0
            ? formatCents(Math.round(stats.totalAmountCents / stats.totalParticipants))
            : '—' }}
          </p>
        </UCard>
      </div>

      <!-- By ticket type -->
      <UCard class="p-4 space-y-3">
        <p class="text-sm font-medium text-highlighted">
          {{ t('events.view.by_ticket_type', 'Par type de billet') }}
        </p>
        <div class="space-y-3">
          <div
            v-for="b in stats.byTicketType"
            :key="b.ticketType.id"
            class="space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm text-highlighted">{{ b.ticketType.name }}</span>
              <div class="flex items-center gap-4">
                <span class="text-xs text-muted">{{ b.sold }} vendu(s)</span>
                <span class="text-sm font-medium text-highlighted">{{ formatCents(b.revenue) }}</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{
                  width: `${stats.totalParticipants > 0
                    ? Math.round(b.sold / stats.totalParticipants * 100)
                    : 0}%`
                }"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Pie chart -->
      <UCard v-if="chartData" class="p-4">
        <p class="text-sm font-medium text-highlighted mb-4">
          {{ t('events.view.chart_title', 'Répartition des billets vendus') }}
        </p>
        <div class="h-64">
          <canvas id="pie-chart" />
        </div>
      </UCard>

    </template>
  </div>
</template>
