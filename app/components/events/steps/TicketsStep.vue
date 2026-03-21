<script setup lang="ts">
import { z } from 'zod'
import type {TicketType} from "~/types/model";

const { t }  = useI18n()
const store  = useEventFormStore()

// ── Modal state ────────────────────────────────────────────
const isOpen      = ref(false)
const editIndex   = ref<number | null>(null)
const isEditing   = computed(() => editIndex.value !== null)

const emptyForm = (): TicketType => ({
  name:          '',
  price:         0,
  quantityTotal: 0,
  status:        'active',
})

const form      = useTemplateRef('form')
const formState = ref<TicketType>(emptyForm())

// ── Schema ─────────────────────────────────────────────────
const schema = z.object({
  name:          z.string().min(1, { message: t('tickets.error.name_required', 'Le nom est obligatoire') }),
  price:         z.number().min(0, { message: t('tickets.error.price_invalid', 'Prix invalide') }),
  quantityTotal: z.number().min(1, { message: t('tickets.error.qty_required', 'Quantité invalide') }),
  status:        z.enum(['active', 'inactive']),
})

const statusOptions = [
  { label: t('tickets.active',   'Actif'),   value: 'active'   },
  { label: t('tickets.inactive', 'Inactif'), value: 'inactive' },
]

// ── Columns ────────────────────────────────────────────────
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

const columns: ColumnDef<TicketType>[] = [
  {
    id:         'name',
    accessorKey: 'name',
    header:      t('tickets.col_name', 'Nom'),
  },
  {
    id:          'price',
    accessorKey: 'price',
    header:      t('tickets.col_price', 'Prix'),
    cell:        ({ row }) => `${row.original.price.toFixed(2)} €`,
  },
  {
    id:          'quantityTotal',
    accessorKey: 'quantityTotal',
    header:      t('tickets.col_qty', 'Quantité'),
  },
  {
    id:          'status',
    accessorKey: 'status',
    header:      t('tickets.col_status', 'Statut'),
  },
  {
    id:     'actions',
    header: 'Actions',
  },
]

// ── Actions ────────────────────────────────────────────────
function openCreate() {
  editIndex.value  = null
  formState.value  = emptyForm()
  isOpen.value     = true
}

function openEdit(index: number) {
  editIndex.value  = index
  formState.value  = { ...store.tickets[index] }
  isOpen.value     = true
}

function closeModal() {
  isOpen.value    = false
  editIndex.value = null
  formState.value = emptyForm()
}

async function saveTicket() {
  try {
    await (form.value as any)?.validate()
  } catch {
    return
  }

  const result = schema.safeParse(formState.value)
  if (!result.success) return

  if (isEditing.value) {
    store.updateTicket(editIndex.value!, result.data)
  } else {
    store.addTicket(result.data)
  }
  closeModal()
}

function removeTicket(index: number) {
  store.removeTicket(index)
}

// ── Validation exposée ─────────────────────────────────────
async function validate(): Promise<boolean> {
  return true // tickets are optional
}

defineExpose({ validate })
</script>

<template>
  <UCard class="w-full overflow-hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <template #header>
      <div class="flex items-center justify-between">
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
          @click="openCreate"
        >
          {{ t('tickets.add', 'Ajouter un billet') }}
        </UButton>
      </div>
    </template>

    <!-- ── Table ───────────────────────────────────────────── -->
    <div v-if="store.tickets.length">
      <UTable :data="store.tickets" :columns="columns">

        <template #status-cell="{ row }">
          <UBadge
            :color="(row.original as TicketType).status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ (row.original as TicketType).status === 'active'
            ? t('tickets.active',   'Actif')
            : t('tickets.inactive', 'Inactif') }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-1">
            <UButton variant="ghost" size="xs" icon="i-lucide-pencil" color="neutral"
                     @click="openEdit(row.index)" />
            <UButton variant="ghost" size="xs" icon="i-lucide-trash-2" color="error"
                     @click="removeTicket(row.index)" />
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
  <UModal v-model:open="isOpen" :title="isEditing
      ? t('tickets.edit',  'Modifier le billet')
      : t('tickets.new',   'Nouveau type de billet')"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="schema"
        :state="formState"
        class="space-y-4"
      >
        <!-- Name -->
        <UFormField :label="t('tickets.col_name', 'Nom')" name="name" required>
          <UInput
            v-model="formState.name"
            :placeholder="t('tickets.name_placeholder', 'Ex : VIP, Standard…')"
            leading-icon="i-lucide-tag"
            class="w-full"
          />
        </UFormField>

        <!-- Price + Quantity -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="t('tickets.col_price', 'Prix (€)')" name="price" required>
            <UInput
              v-model.number="formState.price"
              type="number"
              min="0"
              step="0.01"
              leading-icon="i-lucide-euro"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('tickets.col_qty', 'Quantité')" name="quantityTotal" required>
            <UInput
              v-model.number="formState.quantityTotal"
              type="number"
              min="1"
              leading-icon="i-lucide-hash"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Status -->
        <UFormField :label="t('tickets.col_status', 'Statut')" name="status">
          <USelectMenu
            v-model="formState.status"
            :items="statusOptions"
            value-key="value"
            class="w-full"
          />
        </UFormField>

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
          ? t('common.save',   'Enregistrer')
          : t('tickets.add',   'Ajouter') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
