<script setup lang="ts">
const route   = useRoute()
const eventId = computed(() => Number(route.params.id))
</script>

<template>
  <div style="display:flex;height:100vh;overflow:hidden">
    <EventsDashboardPanel :event-id="eventId" />
    <main style="flex:1;overflow-y:auto;background:var(--color-background-tertiary)">
      <slot />
    </main>
  </div>
</template>
