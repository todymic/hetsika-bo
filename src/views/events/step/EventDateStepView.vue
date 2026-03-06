<script setup lang="ts">
import { DatePicker, Message } from 'primevue'

const props = defineProps<{
  startAt: Date | null
  endAt:   Date | null
}>()

const emit = defineEmits<{
  'update:startAt': [value: Date | null]
  'update:endAt':   [value: Date | null]
}>()
</script>

<template>
  <div class="form-fields">

    <div class="form-row">
      <div class="field">
        <label class="field__label">Date de début <span class="req">*</span></label>
        <DatePicker
          :model-value="startAt"
          show-time
          hour-format="24"
          placeholder="JJ/MM/AAAA HH:mm"
          fluid
          :min-date="new Date()"
          @update:model-value="emit('update:startAt', $event)"
        />
      </div>

      <div class="field">
        <label class="field__label">Date de fin</label>
        <DatePicker
          :model-value="endAt"
          show-time
          hour-format="24"
          placeholder="JJ/MM/AAAA HH:mm"
          fluid
          :min-date="startAt ?? new Date()"
          @update:model-value="emit('update:endAt', $event)"
        />
      </div>
    </div>

    <Message v-if="startAt && endAt && endAt <= startAt" severity="warn" size="small">
      La date de fin doit être postérieure à la date de début.
    </Message>

  </div>
</template>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 640px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* 1 colonne sur mobile */
@media (max-width: 560px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  min-width: 0; /* évite le débordement dans la grid */
}

.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-700);
}

.req { color: var(--p-red-500); margin-left: 2px; }
</style>
