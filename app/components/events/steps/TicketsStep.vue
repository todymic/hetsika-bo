<script setup lang="ts">
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/vue-table'
import type {TicketType} from "~/types/model";

const { t }  = useI18n()
const store  = useEventFormStore()

// ── Schema ─────────────────────────────────────────────────
const schema = z.object({
  name:          z.string().min(1,  { message: t('tickets.error.name_required',     'Le nom est obligatoire')    }),
  price:         z.number().min(0,  { message: t('tickets.error.price_invalid',     'Prix invalide')             }),
  currency:      z.string().min(1,  { message: t('tickets.error.currency_required', 'Devise obligatoire')        }),
  quantityTotal: z.number().min(1,  { message: t('tickets.error.qty_required',      'Quantité invalide')         }),
  description:   z.string().optional(),
})

// ── Currencies ─────────────────────────────────────────────
const CURRENCIES = [
  { label: 'EUR — Euro',           value: 'EUR' },
  { label: 'USD — Dollar',         value: 'USD' },
  { label: 'GBP — Livre sterling', value: 'GBP' },
  { label: 'MGA — Ariary',         value: 'MGA' },
]

// ── Status config (readOnly) ───────────────────────────────
const statusConfig: Record<string, { label: string; color: 'success' | 'neutral' | 'error' | 'warning' }> = {
  ENABLED:  { label: t('tickets.status.enabled',  'Actif'),      color: 'success' },
  DISABLED: { label: t('tickets.status.disabled', 'Désactivé'),  color: 'neutral' },
  SOLD_OUT: { label: t('tickets.status.sold_out', 'Complet'),    color: 'error'   },
  INACTIVE: { label: t('tickets.status.inactive', 'Inactif'),    color: 'warning' },
}

// ── Columns ────────────────────────────────────────────────
const columns: ColumnDef<TicketType>[] = [
  { id: 'name',          accessorKey: 'name',          header: t('tickets.col_name',   'Nom')      },
  { id: 'price',         accessorKey: 'price',         header: t('tickets.col_price',  'Prix')     },
  { id: 'quantityTotal', accessorKey: 'quantityTotal', header: t('tickets.col_qty',    'Quantité') },
  { id: 'quantitySold',  accessorKey: 'quantitySold',  header: t('tickets.col_sold',   'Vendus')   },
  { id: 'status',        accessorKey: 'status',        header: t('tickets.col_status', 'Statut')   },
  { id: 'actions',       header: ''                                                                 },
]

// ── Modal state ────────────────────────────────────────────
const isOpen    = ref(false)
const editIndex = ref<number | null>(null)
const isEditing = computed(() => editIndex.value !== null)

const emptyForm = (): TicketType => ({
  name:          '',
  price:         0,
  currency:      'EUR',
  quantityTotal: 0,
  description:   '',
})

const form      = useTemplateRef('form')
const formState = ref<TicketType>(emptyForm())

// ── Modal actions ──────────────────────────────────────────
function openCreate() {
  editIndex.value = null
  formState.value = emptyForm()
  isOpen.value    = true
}

function openEdit(index: number) {
  editIndex.value = index
  formState.value = { ...store.tickets[index] }
  isOpen.value    = true
}

function closeModal() {
  isOpen.value    = false
  editIndex.value = null
  formState.value = emptyForm()
}

async function saveTicket() {
  try { await (form.value as any)?.validate() } catch { return }

  const result = schema.safeParse(formState.value)
  if (!result.success) return

  if (isEditing.value) {
    store.updateTicket(editIndex.value!, { ...store.tickets[editIndex.value!], ...result.data })
  } else {
    store.addTicket(result.data)
  }
  closeModal()
}

function removeTicket(index: number) {
  store.removeTicket(index)
}

// ── Step validation ────────────────────────────────────────
async function validate(): Promise<boolean> {
  return true // tickets are optional
}

defineExpose({ validate })
</script>

<template>
  <UCard class="w-full overflow-hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <template #header>
      <div class="flex flex-col gap-3">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-lg bg-primary/10 text-primary">
            <UIcon name="i-lucide-ticket" class="size-5" />
          </div>
          <div>
            <h1 class="text-base font-semibold text-highlighted">
              {{ t('events.stepper.tickets.subtitle', 'Types de billets') }}
            </h1>
            <p class="mt-0.5 text-sm text-muted">
              {{ t('events.stepper.tickets.subtitle_hint', 'Définissez les types de billets disponibles.') }}
            </p>
          </div>
        </div>

        <UButton
          icon="i-lucide-plus"
          size="sm"
          class="w-full sm:w-auto sm:self-end"
          @click="openCreate"
        >
          {{ t('tickets.add', 'Ajouter un billet') }}
        </UButton>
      </div>
    </template>

    <!-- ── Table ───────────────────────────────────────────── -->
    <div v-if="store.tickets.length" class="overflow-x-auto -mx-4 px-4">
      <UTable :data="store.tickets" :columns="columns" class="min-w-[520px]">

        <!-- Price + currency -->
        <template #price-cell="{ row }">
          <span>
            {{ (row.original as TicketType).price.toFixed(2) }}
            <span class="text-xs text-muted ml-1">{{ (row.original as TicketType).currency }}</span>
          </span>
        </template>

        <!-- Quantity sold / total -->
        <template #quantityTotal-cell="{ row }">
          <span>
            <span class="text-muted text-xs">{{ (row.original as TicketType).quantitySold ?? 0 }} /</span>
            {{ (row.original as TicketType).quantityTotal }}
          </span>
        </template>

        <!-- Quantity sold -->
        <template #quantitySold-cell="{ row }">
          <span class="text-sm">
            {{ (row.original as TicketType).quantitySold ?? '—' }}
          </span>
        </template>

        <!-- Status badge -->
        <template #status-cell="{ row }">
          <template v-if="(row.original as TicketType).status">
            <UBadge
              :color="statusConfig[(row.original as TicketType).status!]?.color ?? 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ statusConfig[(row.original as TicketType).status!]?.label ?? (row.original as TicketType).status }}
            </UBadge>
          </template>
          <span v-else class="text-xs text-muted">—</span>
        </template>

        <!-- Actions -->
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-1">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-lucide-pencil"
              color="neutral"
              @click="openEdit(row.index)"
            />
            <UButton
              variant="ghost"
              size="xs"
              icon="i-lucide-trash-2"
              color="error"
              @click="removeTicket(row.index)"
            />
          </div>
        </template>

      </UTable>
    </div>

    <!-- ── Empty state ─────────────────────────────────────── -->
    <div v-else class="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
        <UIcon name="i-lucide-ticket" class="size-6 text-muted" />
      </div>
      <div>
        <p class="text-sm font-medium text-highlighted">
          {{ t('tickets.empty', 'Aucun type de billet ajouté') }}
        </p>
        <p class="mt-0.5 text-xs text-muted">
          {{ t('tickets.empty_hint', 'Cliquez sur "Ajouter un billet" pour commencer.') }}
        </p>
      </div>
      <UButton variant="outline" size="sm" icon="i-lucide-plus" @click="openCreate">
        {{ t('tickets.add', 'Ajouter un billet') }}
      </UButton>
    </div>

  </UCard>

  <!-- ── Modal ────────────────────────────────────────────── -->
  <UModal
    v-model:open="isOpen"
    :title="isEditing
      ? t('tickets.edit', 'Modifier le billet')
      : t('tickets.new',  'Nouveau type de billet')"
  >
    <template #body>
      <UForm ref="form" :schema="schema" :state="formState" class="space-y-4">

        <!-- Name -->
        <UFormField :label="t('tickets.col_name', 'Nom')" name="name" required>
          <UInput
            v-model="formState.name"
            :placeholder="t('tickets.name_placeholder', 'Ex : VIP, Standard…')"
            leading-icon="i-lucide-tag"
            class="w-full"
          />
        </UFormField>

        <!-- Description -->
        <UFormField :label="t('tickets.col_description', 'Description')" name="description">
          <template #hint>
            <span class="text-xs text-muted">{{ t('common.optional', 'Optionnel') }}</span>
          </template>
          <UTextarea
            v-model="formState.description"
            :placeholder="t('tickets.description_placeholder', 'Décrivez les avantages de ce billet…')"
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <!-- Price + Currency -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="t('tickets.col_price', 'Prix')" name="price" required>
            <UInput
              v-model.number="formState.price"
              type="number"
              min="0"
              step="0.01"
              leading-icon="i-lucide-coins"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('tickets.col_currency', 'Devise')" name="currency" required>
            <USelectMenu
              v-model="formState.currency"
              :items="CURRENCIES"
              value-key="value"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Quantity total -->
        <UFormField :label="t('tickets.col_qty', 'Quantité totale')" name="quantityTotal" required>
          <UInput
            v-model.number="formState.quantityTotal"
            type="number"
            min="1"
            leading-icon="i-lucide-hash"
            class="w-full"
          />
        </UFormField>

        <!-- Readonly info (edit mode) -->
        <div
          v-if="isEditing && (formState.quantitySold ?? 0) > 0"
          class="flex items-center gap-2 rounded-lg border border-default bg-muted/20 px-3 py-2"
        >
          <UIcon name="i-lucide-info" class="size-4 shrink-0 text-muted" />
          <p class="text-xs text-muted">
            {{ t('tickets.sold_info', { sold: formState.quantitySold, total: formState.quantityTotal }) }}
          </p>
        </div>

        <!-- Status (readOnly display) -->
        <div
          v-if="isEditing && formState.status"
          class="flex items-center justify-between rounded-lg border border-default bg-muted/20 px-3 py-2"
        >
          <span class="text-xs text-muted">{{ t('tickets.col_status', 'Statut') }}</span>
          <UBadge
            :color="statusConfig[formState.status!]?.color ?? 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ statusConfig[formState.status!]?.label ?? formState.status }}
          </UBadge>
        </div>

      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="closeModal">
          {{ t('common.cancel', 'Annuler') }}
        </UButton>
        <UButton
          :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
          @click="saveTicket"
        >
          {{ isEditing
          ? t('common.save', 'Enregistrer')
          : t('tickets.add', 'Ajouter') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
