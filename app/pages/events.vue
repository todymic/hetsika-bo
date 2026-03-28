<template>
  <UDashboardPanel id="events" title="Events" class="bg-gray-100 dark:bg-gray-950">
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
