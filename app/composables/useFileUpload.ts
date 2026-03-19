import type { Media } from '~/types/model'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB    = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function useFileUpload() {
  const { t }  = useI18n()
  const store  = useEventFormStore()

  const isDragging = ref(false)
  const fileError  = ref<string>('')

  function isImage(file: File)     { return file.type.startsWith('image/') }
  function isImageMime(mime: string) { return mime.startsWith('image/') }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type))
      return t('events.stepper.info.upload_error_type', 'Type non supporté')
    if (file.size > MAX_SIZE_BYTES)
      return t('events.stepper.info.upload_error_size', `Max ${MAX_SIZE_MB} Mo`)
    return null
  }

  function addFiles(files: FileList | File[]) {
    const file = Array.from(files)[0]
    if (!file) return

    store.info.uploadedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })

    const error   = validateFile(file)
    const preview = isImage(file) && !error ? URL.createObjectURL(file) : null

    store.info.uploadedFiles = [{ id: crypto.randomUUID(), file, preview, error }]
    store.info.files         = error ? [] : [file]

    if (!error) fileError.value = ''
  }

  function removeFile(id: string) {
    const f = store.info.uploadedFiles.find(f => f.id === id)
    if (f?.preview) URL.revokeObjectURL(f.preview)
    store.info.uploadedFiles = store.info.uploadedFiles.filter(f => f.id !== id)
    store.info.files         = store.info.uploadedFiles.filter(f => !f.error).map(f => f.file)
  }

  function removeExistingFile(media: Media) {
    store.info.removedFileIds.push(media.id)
    store.info.existingFiles = store.info.existingFiles.filter(f => f.id !== media.id)
  }

  function onFileInputChange(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (files) addFiles(files)
  }

  function onDrop(e: DragEvent) {
    isDragging.value = false
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }

  function validateFiles(isEditMode: boolean): boolean {
    const hasFiles = store.info.files.length > 0 || store.info.existingFiles.length > 0

    if (!isEditMode && !hasFiles) {
      fileError.value = t('events.stepper.info.upload_required', 'Veuillez ajouter au moins un fichier.')
      return false
    }
    if (isEditMode && !hasFiles) {
      fileError.value = t('events.stepper.info.upload_required_edit', 'Veuillez conserver ou ajouter au moins un fichier.')
      return false
    }

    fileError.value = ''
    return true
  }

  return {
    // State
    isDragging,
    fileError,
    ACCEPTED_TYPES,
    MAX_SIZE_MB,
    // Computed
    uploadedFiles: computed(() => store.info.uploadedFiles),
    existingFiles: computed(() => store.info.existingFiles),
    // Methods
    addFiles,
    removeFile,
    removeExistingFile,
    onFileInputChange,
    onDrop,
    formatSize,
    isImageMime,
    validateFiles,
  }
}
