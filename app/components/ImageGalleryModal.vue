<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'max-w-4xl' }">
    <template #content>
      <div class="gallery-modal">
        <!-- Header -->
        <div class="gallery-modal__header">
          <div class="gallery-modal__title">
            <span class="gallery-modal__icon">🖼</span>
            <div>
              <h2>{{ t('gallery.title') }}</h2>
              <p>{{ t('gallery.subtitle') }}</p>
            </div>
          </div>
          <button class="gallery-modal__close" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="gallery-modal__tabs">
          <button class="gallery-tab" :class="{ active: activeTab === 'gallery' }" @click="activeTab = 'gallery'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {{ t('gallery.tab_gallery') }}
            <span class="gallery-tab__count">{{ images.length }}</span>
          </button>
          <button class="gallery-tab" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ t('gallery.tab_upload') }}
          </button>
        </div>

        <!-- Gallery Tab -->
        <div v-if="activeTab === 'gallery'" class="gallery-modal__body">
          <div v-if="images.length === 0" class="gallery-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>{{ t('gallery.empty') }}</p>
            <button class="btn-secondary" @click="activeTab = 'upload'">
              {{ t('gallery.upload_cta') }}
            </button>
          </div>

          <div v-else class="gallery-grid">
            <div
              v-for="img in images"
              :key="img.id"
              class="gallery-item"
              :class="{ selected: selectedId === img.id, cover: img.isCover }"
              @click="selectImage(img)"
            >
              <div class="gallery-item__img">
                <img :src="img.url" :alt="img.originalName" />
              </div>

              <span v-if="img.isCover" class="badge badge--cover">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ t('gallery.badge_cover') }}
              </span>

              <span v-if="selectedId === img.id && !img.isCover" class="badge badge--selected">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ t('gallery.badge_selected') }}
              </span>

              <div class="gallery-item__actions">
                <button class="action-btn action-btn--danger" :title="t('gallery.delete')" @click.stop="deleteImage(img)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>

              <div v-if="selectedId === img.id" class="gallery-item__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-if="activeTab === 'upload'" class="gallery-modal__body">
          <div
            class="upload-zone"
            :class="{ 'upload-zone--drag': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              class="upload-zone__input"
              @change="onFileChange"
            />
            <div class="upload-zone__content">
              <div class="upload-zone__icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="upload-zone__label">
                {{ t('gallery.upload_zone_label') }} <span>{{ t('gallery.upload_zone_browse') }}</span>
              </p>
              <p class="upload-zone__hint">{{ t('gallery.upload_zone_hint') }}</p>
            </div>
          </div>

          <div v-if="uploadQueue.length > 0" class="upload-queue">
            <h4>{{ t('gallery.queue_title', { count: uploadQueue.length }) }}</h4>
            <div class="upload-list">
              <div v-for="(item, index) in uploadQueue" :key="index" class="upload-item">
                <div class="upload-item__preview">
                  <img :src="item.preview" :alt="item.file.name" />
                </div>
                <div class="upload-item__info">
                  <span class="upload-item__name">{{ item.file.name }}</span>
                  <span class="upload-item__size">{{ formatSize(item.file.size) }}</span>
                  <div class="upload-item__options">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="item.saveToGallery" />
                      <span>{{ t('gallery.save_to_gallery') }}</span>
                    </label>
                    <label class="checkbox-label">
                      <input type="radio" name="cover" :value="index" v-model="coverIndex" />
                      <span>{{ t('gallery.set_as_cover') }}</span>
                    </label>
                  </div>
                </div>
                <button class="upload-item__remove" @click="removeFromQueue(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="gallery-modal__footer">
          <button class="btn-ghost" @click="close">{{ t('gallery.cancel') }}</button>
          <div class="gallery-modal__footer-right">
            <span v-if="selectedId && activeTab === 'gallery'" class="footer-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
              </svg>
              {{ t('gallery.hint_cover_selected') }}
            </span>
            <button
              v-if="activeTab === 'gallery'"
              class="btn-primary"
              :disabled="!selectedId"
              @click="confirmCover"
            >
              {{ t('gallery.confirm_cover') }}
            </button>
            <button
              v-if="activeTab === 'upload'"
              class="btn-primary"
              :disabled="uploadQueue.length === 0"
              @click="uploadFiles"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ t('gallery.upload_btn', { count: uploadQueue.length }) }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { t } = useI18n()

export interface GalleryImage {
  id: number
  url: string
  thumbnailUrl?: string
  mimeType?: string
  originalName: string
  width?: number
  height?: number
  createdAt?: Date
  isCover?: boolean
  caption?: string
}

interface UploadItem {
  file: File
  preview: string
  saveToGallery: boolean
}

const props = defineProps<{
  modelValue: boolean
  initialImages?: GalleryImage[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'cover-changed': [image: GalleryImage]
  'files-uploaded': [files: File[]]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const activeTab    = ref<'gallery' | 'upload'>('gallery')
const selectedId   = ref<number | null>(null)
const isDragging   = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const coverIndex   = ref<number | null>(null)
const images       = ref<GalleryImage[]>(props.initialImages ?? [])
const uploadQueue  = ref<UploadItem[]>([])

function close() { isOpen.value = false }
function selectImage(img: GalleryImage) { selectedId.value = img.id }

function confirmCover() {
  const img = images.value.find(i => i.id === selectedId.value)
  if (!img) return
  images.value.forEach(i => i.isCover = false)
  img.isCover = true
  emit('cover-changed', img)
  close()
}

function deleteImage(img: GalleryImage) {
  images.value = images.value.filter(i => i.id !== img.id)
  if (selectedId.value === img.id) selectedId.value = null
}

function triggerFileInput() { fileInputRef.value?.click() }

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFilesToQueue(Array.from(files))
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) addFilesToQueue(Array.from(files))
}

function addFilesToQueue(files: File[]) {
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadQueue.value.push({ file, preview: e.target?.result as string, saveToGallery: true })
    }
    reader.readAsDataURL(file)
  })
}

function removeFromQueue(index: number) {
  uploadQueue.value.splice(index, 1)
  if (coverIndex.value === index) coverIndex.value = null
}

function uploadFiles() {
  emit('files-uploaded', uploadQueue.value.map(i => i.file))
  uploadQueue.value
    .filter(i => i.saveToGallery)
    .forEach((item, idx) => {
      images.value.push({
        id:           Date.now() + idx,
        url:          item.preview,
        originalName: item.file.name,
        isCover:      coverIndex.value === idx,
      })
    })
  uploadQueue.value = []
  coverIndex.value  = null
  activeTab.value   = 'gallery'
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} Ko`
    : `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}
</script>

<style scoped>
.gallery-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 85vh;
  background: #0f1117;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  color: #e2e8f0;
}

.gallery-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.gallery-modal__title { display: flex; align-items: center; gap: 14px; }

.gallery-modal__icon {
  width: 42px; height: 42px;
  background: rgba(99,102,241,0.15);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}

.gallery-modal__title h2 { font-size: 17px; font-weight: 600; color: #f1f5f9; margin: 0 0 2px; }
.gallery-modal__title p  { font-size: 13px; color: #64748b; margin: 0; }

.gallery-modal__close {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.gallery-modal__close:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; }

.gallery-modal__tabs {
  display: flex; gap: 4px;
  padding: 12px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.gallery-tab {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-radius: 8px; border: none;
  background: transparent; color: #64748b;
  font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.gallery-tab:hover  { background: rgba(255,255,255,0.06); color: #94a3b8; }
.gallery-tab.active { background: rgba(99,102,241,0.15);  color: #a5b4fc; }

.gallery-tab__count {
  background: rgba(255,255,255,0.08);
  border-radius: 99px; padding: 1px 8px;
  font-size: 11px; font-weight: 600;
}
.gallery-tab.active .gallery-tab__count { background: rgba(99,102,241,0.3); color: #c7d2fe; }

.gallery-modal__body {
  flex: 1; overflow-y: auto;
  padding: 24px 28px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.gallery-item {
  position: relative; border-radius: 10px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent;
  transition: all 0.2s; aspect-ratio: 4/3; background: #1a1f2e;
}
.gallery-item:hover    { border-color: rgba(99,102,241,0.4); transform: translateY(-2px); }
.gallery-item.selected { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
.gallery-item.cover    { border-color: #f59e0b; }

.gallery-item__img     { width: 100%; height: 100%; }
.gallery-item__img img { width: 100%; height: 100%; object-fit: cover; }

.badge {
  position: absolute; top: 8px; left: 8px;
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 99px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.02em;
}
.badge--cover    { background: rgba(245,158,11,0.9); color: #1a0e00; }
.badge--selected { background: rgba(99,102,241,0.9); color: #fff; }

.gallery-item__actions {
  position: absolute; top: 8px; right: 8px;
  display: flex; gap: 6px;
  opacity: 0; transition: opacity 0.15s;
}
.gallery-item:hover .gallery-item__actions { opacity: 1; }

.action-btn {
  width: 28px; height: 28px; border-radius: 6px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.action-btn--danger       { background: rgba(239,68,68,0.85); color: white; }
.action-btn--danger:hover { background: #ef4444; }

.gallery-item__check {
  position: absolute; bottom: 8px; right: 8px;
  width: 24px; height: 24px; border-radius: 99px;
  background: #6366f1;
  display: flex; align-items: center; justify-content: center;
  color: white;
}

.gallery-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px;
  padding: 60px 20px; color: #475569; text-align: center;
}
.gallery-empty p { font-size: 14px; margin: 0; }

.upload-zone {
  border: 2px dashed rgba(255,255,255,0.1);
  border-radius: 12px; padding: 48px 24px;
  text-align: center; cursor: pointer;
  transition: all 0.2s; position: relative;
}
.upload-zone:hover,
.upload-zone--drag  { border-color: #6366f1; background: rgba(99,102,241,0.05); }
.upload-zone__input { display: none; }

.upload-zone__content {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px; pointer-events: none;
}

.upload-zone__icon {
  width: 72px; height: 72px; border-radius: 16px;
  background: rgba(99,102,241,0.1);
  display: flex; align-items: center; justify-content: center;
  color: #6366f1;
}

.upload-zone__label { font-size: 14px; color: #94a3b8; margin: 0; }
.upload-zone__label span { color: #818cf8; text-decoration: underline; text-underline-offset: 3px; }
.upload-zone__hint  { font-size: 12px; color: #475569; margin: 0; }

.upload-queue    { margin-top: 20px; }
.upload-queue h4 {
  font-size: 13px; font-weight: 600; color: #64748b;
  margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.08em;
}

.upload-list { display: flex; flex-direction: column; gap: 10px; }

.upload-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);
}

.upload-item__preview     { width: 60px; height: 45px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
.upload-item__preview img { width: 100%; height: 100%; object-fit: cover; }
.upload-item__info        { flex: 1; min-width: 0; }

.upload-item__name {
  display: block; font-size: 13px; font-weight: 500; color: #cbd5e1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.upload-item__size    { display: block; font-size: 12px; color: #475569; margin-top: 2px; }
.upload-item__options { display: flex; gap: 16px; margin-top: 6px; }

.checkbox-label       { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; cursor: pointer; }
.checkbox-label input { accent-color: #6366f1; }

.upload-item__remove {
  width: 32px; height: 32px; border-radius: 6px; border: none;
  background: rgba(239,68,68,0.1); color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all 0.15s;
}
.upload-item__remove:hover { background: rgba(239,68,68,0.2); }

.gallery-modal__footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px;
  border-top: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.gallery-modal__footer-right { display: flex; align-items: center; gap: 12px; }
.footer-hint { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }

.btn-primary {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: 8px; border: none;
  background: #6366f1; color: white;
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #5558e8; transform: translateY(-1px); }
.btn-primary:disabled             { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  padding: 8px 16px; border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.1); color: #a5b4fc;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.btn-secondary:hover { background: rgba(99,102,241,0.2); }

.btn-ghost {
  padding: 9px 16px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent; color: #64748b;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
</style>
