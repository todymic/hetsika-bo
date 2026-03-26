<script setup lang="ts">
defineProps<{
  icon:        string
  title:       string
  description: string
  isDirty:     boolean
  saving:      boolean
}>()

defineEmits<{
  save:   []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UIcon :name="icon" class="size-4" />
      </div>
      <div>
        <h1 class="text-base font-semibold text-highlighted">{{ title }}</h1>
        <p class="text-xs text-muted">{{ description }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Unsaved indicator -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isDirty" class="flex items-center gap-1.5">
          <div class="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
          <span class="text-xs text-muted">
            {{ t('common.unsaved_changes', 'Modifications non enregistrées') }}
          </span>
        </div>
      </Transition>

      <UButton
        v-if="isDirty"
        variant="ghost"
        size="sm"
        color="neutral"
        @click="$emit('cancel')"
      >
        {{ t('common.cancel', 'Annuler') }}
      </UButton>

      <UButton
        icon="i-lucide-save"
        size="sm"
        :loading="saving"
        :disabled="!isDirty"
        :variant="isDirty ? 'solid' : 'outline'"
        @click="$emit('save')"
      >
        {{ t('common.save', 'Enregistrer') }}
      </UButton>
    </div>
  </div>
</template>
