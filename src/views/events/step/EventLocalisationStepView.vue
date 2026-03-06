<script setup lang="ts">
import { InputText, Select } from 'primevue'

defineProps<{
  street:         string
  city:           string
  zipcode:        string
  countryCode:    string
  countryOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  'update:street':      [value: string]
  'update:city':        [value: string]
  'update:zipcode':     [value: string]
  'update:countryCode': [value: string]
}>()
</script>

<template>
  <div class="form-fields">

    <div class="field">
      <label class="field__label">Rue <span class="req">*</span></label>
      <InputText
        :model-value="street"
        placeholder="Ex : 12 avenue des Roses"
        fluid
        @update:model-value="emit('update:street', $event)"
      />
    </div>

    <div class="form-row">
      <div class="field">
        <label class="field__label">Ville <span class="req">*</span></label>
        <InputText
          :model-value="city"
          placeholder="Paris"
          fluid
          @update:model-value="emit('update:city', $event)"
        />
      </div>
      <div class="field">
        <label class="field__label">Code postal <span class="req">*</span></label>
        <InputText
          :model-value="zipcode"
          placeholder="75001"
          fluid
          @update:model-value="emit('update:zipcode', $event)"
        />
      </div>
    </div>

    <div class="field">
      <label class="field__label">Pays <span class="req">*</span></label>
      <Select
        :model-value="countryCode"
        :options="countryOptions"
        option-label="label"
        option-value="value"
        placeholder="Sélectionnez un pays"
        fluid
        @update:model-value="emit('update:countryCode', $event)"
      />
    </div>

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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-700);
}

.req { color: var(--p-red-500); margin-left: 2px; }

/* 2 colonnes sur desktop, 1 sur mobile */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
