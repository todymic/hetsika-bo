<script setup lang="ts">
definePageMeta({ layout: 'event-dashboard' })

const { t } = useI18n()
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-lg font-semibold text-highlighted">
      {{ t('events.dashboard.menu.claims', 'Réclamations') }}
    </h1>

    <UCard class="p-8 text-center">
      <UIcon name="i-lucide-message-circle-warning" class="size-8 text-muted mx-auto" />
      <p class="mt-2 text-sm font-medium text-highlighted">
        {{ t('claims.coming_soon', 'Module réclamations') }}
      </p>
      <p class="mt-1 text-xs text-muted">
        {{ t('claims.coming_soon_hint', 'Cette fonctionnalité sera disponible prochainement.') }}
      </p>
    </UCard>
  </div>
</template>
