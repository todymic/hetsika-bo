import { onBeforeRouteLeave } from 'vue-router'

export function useUnsavedChanges<T>(initial: Ref<T>) {
  const saved     = ref(JSON.stringify(toRaw(initial.value)))
  const isDirty   = computed(() => JSON.stringify(toRaw(initial.value)) !== saved.value)

  function markSaved() {
    saved.value = JSON.stringify(toRaw(initial.value))
  }

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true
    return window.confirm('Vous avez des modifications non enregistrées. Quitter quand même ?')
  })

  return { isDirty, markSaved }
}
