<script setup lang="ts">
import { ref } from 'vue'
import {
  Button, Tag, DataTable, Column,
  Dialog, InputText, InputNumber, ToggleSwitch
} from 'primevue'

export interface TicketType {
  id:       number
  name:     string
  price:    number
  quantity: number
  status:   'ACTIVE' | 'INACTIVE'
}

const props = defineProps<{ tickets: TicketType[] }>()
const emit  = defineEmits<{ 'update:tickets': [value: TicketType[]] }>()

const dialogOpen    = ref(false)
const editingTicket = ref<Partial<TicketType>>({})
const isEditing     = ref(false)

const openNew = () => {
  editingTicket.value = { name: '', price: 0, quantity: 0, status: 'ACTIVE' }
  isEditing.value = false
  dialogOpen.value = true
}
const openEdit = (t: TicketType) => {
  editingTicket.value = { ...t }
  isEditing.value = true
  dialogOpen.value = true
}
const save = () => {
  const list = [...props.tickets]
  if (isEditing.value) {
    const idx = list.findIndex(t => t.id === editingTicket.value.id)
    if (idx !== -1) list[idx] = { ...editingTicket.value } as TicketType
  } else {
    list.push({ ...editingTicket.value, id: Date.now() } as TicketType)
  }
  emit('update:tickets', list)
  dialogOpen.value = false
}
const remove = (id: number) => {
  emit('update:tickets', props.tickets.filter(t => t.id !== id))
}
</script>

<template>
  <div class="form-fields">

    <!-- Empty -->
    <div v-if="!tickets.length" class="tickets-empty">
      <i class="pi pi-ticket tickets-empty__icon" />
      <p class="tickets-empty__title">Aucun billet ajouté</p>
      <p class="tickets-empty__sub">Créez au moins un type de billet pour votre événement</p>
      <Button label="Ajouter un billet" icon="pi pi-plus" outlined size="small" @click="openNew" />
    </div>

    <!-- Table desktop -->
    <template v-else>
      <div class="tickets-desktop">
        <DataTable :value="tickets" class="tickets-table" size="small">
          <Column field="name"     header="Nom" />
          <Column field="price"    header="Prix">
            <template #body="{ data }">{{ data.price.toFixed(2) }} €</template>
          </Column>
          <Column field="quantity" header="Quantité" />
          <Column field="status"   header="Statut">
            <template #body="{ data }">
              <Tag
                :value="data.status === 'ACTIVE' ? 'Actif' : 'Inactif'"
                :severity="data.status === 'ACTIVE' ? 'success' : 'secondary'"
              />
            </template>
          </Column>
          <Column header="" style="width:80px">
            <template #body="{ data }">
              <div class="row-actions">
                <Button icon="pi pi-pencil" text rounded severity="secondary" size="small" @click="openEdit(data)" />
                <Button icon="pi pi-trash"  text rounded severity="danger"    size="small" @click="remove(data.id)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Cards mobile -->
      <div class="tickets-mobile">
        <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
          <div class="ticket-card__top">
            <span class="ticket-card__name">{{ ticket.name }}</span>
            <Tag
              :value="ticket.status === 'ACTIVE' ? 'Actif' : 'Inactif'"
              :severity="ticket.status === 'ACTIVE' ? 'success' : 'secondary'"
              class="ticket-card__tag"
            />
          </div>
          <div class="ticket-card__meta">
            <span><i class="pi pi-euro" /> {{ ticket.price.toFixed(2) }} €</span>
            <span><i class="pi pi-users" /> {{ ticket.quantity }} places</span>
          </div>
          <div class="ticket-card__actions">
            <Button icon="pi pi-pencil" label="Modifier" text severity="secondary" size="small" @click="openEdit(ticket)" />
            <Button icon="pi pi-trash"  label="Supprimer" text severity="danger"   size="small" @click="remove(ticket.id)" />
          </div>
        </div>
      </div>

      <div>
        <Button label="Ajouter un type de billet" icon="pi pi-plus" outlined size="small" @click="openNew" />
      </div>
    </template>

  </div>

  <!-- Dialog -->
  <Dialog
    v-model:visible="dialogOpen"
    :header="isEditing ? 'Modifier le billet' : 'Nouveau type de billet'"
    modal
    :style="{ width: 'min(420px, 95vw)' }"
  >
    <div class="dialog-form">
      <div class="field">
        <label class="field__label">Nom <span class="req">*</span></label>
        <InputText v-model="editingTicket.name" placeholder="Ex : VIP, Standard…" fluid />
      </div>
      <div class="field">
        <label class="field__label">Prix (€)</label>
        <InputNumber v-model="editingTicket.price" :min="0" :fraction-digits="2" fluid />
      </div>
      <div class="field">
        <label class="field__label">Quantité disponible</label>
        <InputNumber v-model="editingTicket.quantity" :min="0" fluid />
      </div>
      <div class="field">
        <label class="field__label">Statut</label>
        <div class="toggle-row">
          <ToggleSwitch v-model="editingTicket.status" true-value="ACTIVE" false-value="INACTIVE" />
          <span class="toggle-label">{{ editingTicket.status === 'ACTIVE' ? 'Actif' : 'Inactif' }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Annuler" severity="secondary" outlined @click="dialogOpen = false" />
      <Button
        :label="isEditing ? 'Enregistrer' : 'Ajouter'"
        icon="pi pi-check"
        :disabled="!editingTicket.name?.trim()"
        @click="save"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field__label { font-size: 0.8rem; font-weight: 600; color: var(--p-surface-700); }
.req { color: var(--p-red-500); margin-left: 2px; }

/* ── Empty ── */
.tickets-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.6rem; padding: 2.5rem 1rem;
  border: 1.5px dashed var(--p-surface-200);
  border-radius: 8px; background: var(--p-surface-50); text-align: center;
}
.tickets-empty__icon { font-size: 1.75rem; color: var(--p-surface-300); }
.tickets-empty__title { font-size: 0.9rem; font-weight: 600; color: var(--p-surface-600); margin: 0; }
.tickets-empty__sub { font-size: 0.78rem; color: var(--p-surface-400); margin: 0 0 0.25rem; }

/* ── Desktop table ── */
.tickets-desktop {
  display: block;
}
.tickets-table {
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  overflow: hidden;
}
.row-actions { display: flex; gap: 0.1rem; }

/* ── Mobile cards ── */
.tickets-mobile {
  display: none;
  flex-direction: column;
  gap: 0.75rem;
}

.ticket-card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ticket-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.ticket-card__name { font-size: 0.9rem; font-weight: 600; color: var(--p-surface-800); }
.ticket-card__meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--p-surface-500);
}
.ticket-card__meta .pi { font-size: 0.72rem; margin-right: 0.25rem; }
.ticket-card__actions {
  display: flex;
  gap: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-surface-100);
}

@media (max-width: 600px) {
  .tickets-desktop { display: none; }
  .tickets-mobile  { display: flex; }
}

/* ── Dialog ── */
.dialog-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.25rem 0 0.5rem; }
.toggle-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.4rem 0; }
.toggle-label { font-size: 0.84rem; color: var(--p-surface-600); }
</style>
