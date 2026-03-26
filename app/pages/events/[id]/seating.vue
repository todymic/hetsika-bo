<script setup lang="ts">
definePageMeta({ layout: 'event-dashboard' })

const { t }   = useI18n()
const route   = useRoute()
const eventId = Number(route.params.id)
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-highlighted">
        {{ t('events.dashboard.menu.seating', 'Plan de salle') }}
      </h1>
      <UButton
        icon="i-lucide-pencil"
        size="sm"
        variant="outline"
        :to="`/events/${eventId}/seating/edit`"
      >
        {{ t('events.view.edit_seating', 'Éditer le plan') }}
      </UButton>
    </div>

    <!-- Viewer placeholder — sera remplacé par SeatingPlanViewer -->
    <UCard class="p-8 text-center">
      <UIcon name="i-lucide-layout-dashboard" class="size-8 text-muted mx-auto" />
      <p class="mt-2 text-sm font-medium text-highlighted">
        {{ t('seating.no_plan', 'Aucun plan de salle configuré') }}
      </p>
      <p class="mt-1 text-xs text-muted">
        {{ t('seating.no_plan_hint', 'Créez un plan de salle pour gérer les places.') }}
      </p>
      <UButton
        class="mt-4"
        size="sm"
        icon="i-lucide-plus"
        :to="`/events/${eventId}/seating/edit`"
      >
        {{ t('seating.create_plan', 'Créer un plan de salle') }}
      </UButton>
    </UCard>
  </div>
</template>
