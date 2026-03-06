<script setup lang="ts">
import { InputText, Textarea, Select, FileUpload } from 'primevue'

defineProps<{
  title:           string
  description:     string
  categories:      { id: number; name: string }[]
  coverPreview:    string | null
  categoryOptions: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  'update:title':        [value: string]
  'update:description':  [value: string]
  'update:categories':   [value: { id: number; name: string }[]]
  'update:coverPreview': [value: string | null]
}>()

const onCoverSelect = (event: any) => {
  const file = event.files?.[0]
  if (file) emit('update:coverPreview', URL.createObjectURL(file))
}
</script>

<template>
  <div class="form-fields">

    <div class="field">
      <label class="field__label">Titre de l'événement <span class="req">*</span></label>
      <InputText
        :model-value="title"
        placeholder="Ex : Festival Jazz au Parc"
        fluid
        @update:model-value="emit('update:title', $event)"
      />
    </div>

    <div class="field">
      <label class="field__label">Description</label>
      <Textarea
        :model-value="description"
        placeholder="Décrivez votre événement…"
        rows="3"
        fluid
        auto-resize
        @update:model-value="emit('update:description', $event)"
      />
    </div>

    <div class="field">
      <label class="field__label">Catégories</label>
      <Select
        :model-value="categories"
        :options="categoryOptions"
        option-label="name"
        placeholder="Sélectionnez des catégories"
        multiple
        fluid
        @update:model-value="emit('update:categories', $event)"
      />
    </div>

    <div class="field">
      <label class="field__label">Image de couverture</label>
      <div v-if="coverPreview" class="cover-preview">
        <img :src="coverPreview" alt="cover" />
        <button class="cover-preview__remove" @click="emit('update:coverPreview', null)">
          <i class="pi pi-times" />
        </button>
      </div>
      <div v-else class="cover-dropzone">
        <i class="pi pi-image cover-dropzone__icon" />
        <p class="cover-dropzone__text">Glissez une image ou cliquez pour parcourir</p>
        <FileUpload
          mode="basic"
          accept="image/*"
          :max-file-size="5000000"
          choose-label="Parcourir"
          choose-icon="pi pi-upload"
          auto
          @select="onCoverSelect"
        />
      </div>
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

.cover-preview {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--p-surface-200);
}
@media (max-width: 480px) { .cover-preview { height: 130px; } }

.cover-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }

.cover-preview__remove {
  position: absolute;
  top: 0.5rem; right: 0.5rem;
  width: 28px; height: 28px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; transition: background 0.15s;
}
.cover-preview__remove:hover { background: rgba(0,0,0,0.75); }

.cover-dropzone {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.6rem; padding: 2rem 1rem;
  border: 1.5px dashed var(--p-surface-300);
  border-radius: 8px; background: var(--p-surface-50);
  text-align: center; transition: border-color 0.15s, background 0.15s; cursor: pointer;
}
.cover-dropzone:hover { border-color: var(--p-primary-300); background: var(--p-primary-50); }
.cover-dropzone__icon { font-size: 1.75rem; color: var(--p-surface-300); }
.cover-dropzone__text { font-size: 0.8rem; color: var(--p-surface-400); margin: 0; }
</style>
