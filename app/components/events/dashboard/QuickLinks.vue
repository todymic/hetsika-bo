<script setup lang="ts">
defineProps<{ eventId: number; current: string }>()

const { t } = useI18n()

const links = (id: number) => [
  { label: t('events.dashboard.menu.info',         'Informations'), icon: 'i-lucide-badge-info',    to: `/events/${id}`              },
  { label: t('events.dashboard.menu.localisation', 'Localisation'), icon: 'i-lucide-map-pin',       to: `/events/${id}/localisation`  },
  { label: t('events.dashboard.menu.dates',        'Dates'),        icon: 'i-lucide-calendar-days', to: `/events/${id}/dates`         },
  { label: t('events.dashboard.menu.tickets',      'Billets'),      icon: 'i-lucide-ticket',        to: `/events/${id}/tickets`       },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
    <NuxtLink
      v-for="link in links(eventId)"
      :key="link.to"
      :to="link.to"
      class="flex items-center gap-2 rounded-lg border border-default bg-background
             px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
      :class="link.to === current ? 'opacity-40 pointer-events-none' : ''"
    >
      <UIcon :name="link.icon" class="size-3.5 shrink-0 text-muted" />
      <span class="truncate text-xs font-medium text-highlighted">{{ link.label }}</span>
      <UIcon name="i-lucide-arrow-right" class="ml-auto size-3 shrink-0 text-muted" />
    </NuxtLink>
  </div>
</template>
