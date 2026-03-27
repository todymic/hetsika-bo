<script setup lang="ts">
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/vue-table'
import type { TicketType } from '~/stores/eventForm'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                                              = useI18n()
const route                                              = useRoute()
const toast                                              = useToast()
const { getEventTicketTypes, saveTicketType, deleteTicketType } = useEventStore()
const eventId                                            = Number(route.params.id)

const pending = ref(true)
const tickets = ref<TicketType[]>([])

onMounted(async () => {
  try   { tickets.value = await getEventTicketTypes(eventId) }
  finally { pending.value = false }
})

// ── Modal ──────────────────────────────────────────────────
const isOpen    = ref(false)
const editIndex = ref<number | null>(null)
const isEditing = computed(() => editIndex.value !== null)
const form      = useTemplateRef('form')
const saving    = ref(false)

const emptyForm = (): TicketType => ({ name: '', price: 0, currency: 'EUR', quantityTotal: 0, description: '' })
const formState = ref<TicketType>(emptyForm())

const schema = z.object({
  name:          z.string().min(1),
  price:         z.number().min(0),
  currency:      z.string().min(1),
  quantityTotal: z.number().min(1),
  description:   z.string().optional(),
})

const CURRENCIES = [
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
  { label: 'GBP', value: 'GBP' },
  { label: 'MGA', value: 'MGA' },
]

const statusConfig: Record<string, { label: string; color: 'success' | 'neutral' | 'error' | 'warning' }> = {
  ENABLED:  { label: t('tickets.status.enabled',  'Actif'),     color: 'success' },
  DISABLED: { label: t('tickets.status.disabled', 'Désactivé'), color: 'neutral' },
  SOLD_OUT: { label: t('tickets.status.sold_out', 'Complet'),   color: 'error'   },
  INACTIVE: { label: t('tickets.status.inactive', 'Inactif'),   color: 'warning' },
}

const columns: ColumnDef<TicketType>[] = [
  { id: 'name',          accessorKey: 'name',          header: t('tickets.col_name',  'Nom')      },
  { id: 'price',         accessorKey: 'price',         header: t('tickets.col_price', 'Prix')     },
  { id: 'quantityTotal', accessorKey: 'quantityTotal', header: t('tickets.col_qty',   'Quantité') },
  { id: 'quantitySold',  accessorKey: 'quantitySold',  header: t('tickets.col_sold',  'Vendus')   },
  { id: 'status',        accessorKey: 'status',        header: t('tickets.col_status','Statut')   },
  { id: 'actions',       header: ''                                                                },
]

function formatCents(price: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr', { style: 'currency', currency }).format(price)
}

function openCreate() { editIndex.value = null; formState.value = emptyForm(); isOpen.value = true }
function openEdit(index: number) { editIndex.value = index; formState.value = { ...tickets.value[index] }; isOpen.value = true }
function closeModal() { isOpen.value = false; editIndex.value = null; formState.value = emptyForm() }

async function saveTicket() {
  try { await (form.value as any)?.validate() } catch { return }
  const result = schema.safeParse(formState.value)
  if (!result.success) return

  saving.value = true
  try {
    const ticket: TicketType = { ...formState.value, ...result.data }
    await saveTicketType(eventId, ticket)
    tickets.value = await getEventTicketTypes(eventId)
    toast.add({ title: isEditing.value ? t('tickets.updated', 'Billet mis à jour') : t('tickets.created', 'Billet créé'), color: 'success' })
    closeModal()
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function removeTicket(ticket: TicketType) {
  if (!ticket.id) return
  try {
    await deleteTicketType(ticket.id)
    tickets.value = tickets.value.filter(t => t.id !== ticket.id)
    toast.add({ title: t('tickets.deleted', 'Billet supprimé'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  }
}
</script>

<template>
  <div class="p-6 space-y-6">

    <div class="flex items-center justify-between gap-3">
      <h1 class="text-base font-semibold text-highlighted sm:text-lg">
        {{ t('events.dashboard.menu.tickets') }}
      </h1>
      <UButton icon="i-lucide-plus" size="sm" @click="openCreate">
        <span class="hidden sm:inline">{{ t('tickets.add', 'Ajouter un billet') }}</span>
        <span class="sm:hidden">Ajouter</span>
      </UButton>
    </div>

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <UCard v-else-if="tickets.length" class="overflow-hidden p-0">
      <div class="overflow-x-auto">
        <UTable :data="tickets" :columns="columns" class="min-w-[520px]">

          <template #price-cell="{ row }">
            {{ formatCents((row.original as TicketType).price, (row.original as TicketType).currency) }}
          </template>

          <template #quantityTotal-cell="{ row }">
            <div class="space-y-1">
              <span class="text-sm">
                {{ (row.original as TicketType).quantitySold ?? 0 }} / {{ (row.original as TicketType).quantityTotal }}
              </span>
              <div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted/40">
                <div
                  class="h-full rounded-full bg-primary"
                  :style="{ width: `${Math.min(100, ((row.original as TicketType).quantitySold ?? 0) / (row.original as TicketType).quantityTotal * 100)}%` }"
                />
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              v-if="(row.original as TicketType).status"
              :color="statusConfig[(row.original as TicketType).status!]?.color ?? 'neutral'"
              variant="subtle" size="sm"
            >
              {{ statusConfig[(row.original as TicketType).status!]?.label }}
            </UBadge>
            <span v-else class="text-xs text-muted">—</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton variant="ghost" size="xs" icon="i-lucide-pencil" color="neutral"
                       @click="openEdit(row.index)" />
              <UButton variant="ghost" size="xs" icon="i-lucide-trash-2" color="error"
                       @click="removeTicket(row.original as TicketType)" />
            </div>
          </template>

        </UTable>
      </div>
    </UCard>

    <UCard v-else class="p-8 text-center">
      <UIcon name="i-lucide-ticket" class="size-8 text-muted mx-auto" />
      <p class="mt-2 text-sm text-muted">{{ t('tickets.empty', 'Aucun type de billet') }}</p>
      <UButton class="mt-4" size="sm" icon="i-lucide-plus" variant="outline" @click="openCreate">
        {{ t('tickets.add', 'Ajouter un billet') }}
      </UButton>
    </UCard>

  </div>

  <!-- Modal -->
  <UModal
    v-model:open="isOpen"
    :title="isEditing ? t('tickets.edit', 'Modifier') : t('tickets.new', 'Nouveau billet')"
  >
    <template #body>
      <UForm ref="form" :schema="schema" :state="formState" class="space-y-4">
        <UFormField :label="t('tickets.col_name', 'Nom')" name="name" required>
          <UInput v-model="formState.name" :placeholder="t('tickets.name_placeholder', 'Ex : VIP')" leading-icon="i-lucide-tag" class="w-full" />
        </UFormField>
        <UFormField :label="t('tickets.col_description', 'Description')" name="description">
          <template #hint><span class="text-xs text-muted">{{ t('common.optional', 'Optionnel') }}</span></template>
          <UTextarea v-model="formState.description" :rows="2" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="t('tickets.col_price', 'Prix')" name="price" required>
            <UInput v-model.number="formState.price" type="number" min="0" step="0.01" leading-icon="i-lucide-coins" class="w-full" />
          </UFormField>
          <UFormField :label="t('tickets.col_currency', 'Devise')" name="currency" required>
            <USelectMenu v-model="formState.currency" :items="CURRENCIES" value-key="value" class="w-full" />
          </UFormField>
        </div>
        <UFormField :label="t('tickets.col_qty', 'Quantité totale')" name="quantityTotal" required>
          <UInput v-model.number="formState.quantityTotal" type="number" min="1" leading-icon="i-lucide-hash" class="w-full" />
        </UFormField>
        <div v-if="isEditing && (formState.quantitySold ?? 0) > 0"
             class="flex items-center gap-2 rounded-lg border border-default bg-muted/20 px-3 py-2">
          <UIcon name="i-lucide-info" class="size-4 shrink-0 text-muted" />
          <p class="text-xs text-muted">
            {{ t('tickets.sold_info', { sold: formState.quantitySold, total: formState.quantityTotal }) }}
          </p>
        </div>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="closeModal">{{ t('common.cancel', 'Annuler') }}</UButton>
        <UButton :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'" :loading="saving" @click="saveTicket">
          {{ isEditing ? t('common.save', 'Enregistrer') : t('tickets.add', 'Ajouter') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
