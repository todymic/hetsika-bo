import type { Media } from '~/types/model'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB    = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export interface UploadedFile {
  id:      string
  file:    File
  preview: string | null
  error:   string | null
}

export function useFileUpload() {
  const { t } = useI18n()

  // ── State local (plus de dépendance au store) ──────────
  const uploadedFiles = ref<UploadedFile[]>([])
  const isDragging    = ref(false)
  const fileError     = ref<string>('')

  // ── Helpers ────────────────────────────────────────────
  function isImage(file: File)       { return file.type.startsWith('image/') }
  function isImageMime(mime: string) { return mime.startsWith('image/') }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type))
      return t('events.stepper.info.upload_error_type', 'Type non supporté (JPG, PNG, WEBP)')
    if (file.size > MAX_SIZE_BYTES)
      return t('events.stepper.info.upload_error_size', `Max ${MAX_SIZE_MB} Mo`)
    return null
  }

  // ── Add (single file — remplace le précédent) ─────────
  function addFiles(files: FileList | File[]) {
    const file = Array.from(files)[0]
    if (!file) return

    // Révoque les previews existants
    uploadedFiles.value.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })

    const error   = validateFile(file)
    const preview = isImage(file) && !error ? URL.createObjectURL(file) : null

    uploadedFiles.value = [{ id: crypto.randomUUID(), file, preview, error }]

    if (!error) fileError.value = ''
    else        fileError.value = error
  }

  // ── Remove ─────────────────────────────────────────────
  function removeFile(id: string) {
    const f = uploadedFiles.value.find(f => f.id === id)
    if (f?.preview) URL.revokeObjectURL(f.preview)
    uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
  }

  // ── Existing files (mode édition) ─────────────────────
  const existingFiles    = ref<Media[]>([])
  const removedFileIds   = ref<number[]>([])

  function setExistingFiles(medias: Media[]) {
    existingFiles.value = medias
  }

  function removeExistingFile(media: Media) {
    removedFileIds.value.push(media.id)
    existingFiles.value = existingFiles.value.filter(f => f.id !== media.id)
  }

  // ── Events ────────────────────────────────────────────
  function onFileInputChange(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (files) addFiles(files)
    // Reset input pour permettre de re-sélectionner le même fichier
    ;(e.target as HTMLInputElement).value = ''
  }

  function onDrop(e: DragEvent) {
    isDragging.value = false
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }

  // ── Validation ────────────────────────────────────────
  function validateFiles(isEditMode: boolean): boolean {
    const hasNew      = uploadedFiles.value.some(f => !f.error)
    const hasExisting = existingFiles.value.length > 0
    const hasFiles    = hasNew || hasExisting

    if (!hasFiles) {
      fileError.value = isEditMode
        ? t('events.stepper.info.error.upload_required_edit', 'Veuillez conserver ou ajouter au moins une image.')
        : t('events.stepper.info.error.upload_required',      'Veuillez ajouter une image de couverture.')
      return false
    }

    fileError.value = ''
    return true
  }

  // ── Computed helpers ───────────────────────────────────
  const validFiles  = computed(() => uploadedFiles.value.filter(f => !f.error))
  const currentFile = computed(() => uploadedFiles.value[0] ?? null)

  // ── Cleanup ────────────────────────────────────────────
  onUnmounted(() => {
    uploadedFiles.value.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
  })

  // ── Reset ──────────────────────────────────────────────
  function reset() {
    uploadedFiles.value.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    uploadedFiles.value  = []
    existingFiles.value  = []
    removedFileIds.value = []
    fileError.value      = ''
    isDragging.value     = false
  }

  return {
    // State
    isDragging,
    fileError,
    uploadedFiles,
    existingFiles,
    removedFileIds,
    // Computed
    validFiles,
    currentFile,
    // Constants
    ACCEPTED_TYPES,
    MAX_SIZE_MB,
    // Methods
    addFiles,
    removeFile,
    removeExistingFile,
    setExistingFiles,
    onFileInputChange,
    onDrop,
    formatSize,
    isImageMime,
    validateFiles,
    reset,
  }
}
