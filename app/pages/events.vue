<template>
  <UDashboardPanel id="events" title="Events">
    <template #header>
      <UDashboardNavbar v-if="!eventId" :title="t('events.header.title')" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
const { t } = useI18n()
const route       = useRoute()
const eventId     = computed(() => Number(route.params.id))
</script>
