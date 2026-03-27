<script setup lang="ts">
const route       = useRoute()
const eventId     = computed(() => Number(route.params.id))
const sidebarOpen = ref(false)

// Ferme le sidebar à chaque changement de route
watch(() => route.path, () => { sidebarOpen.value = false })
</script>

<template>
  <div class="relative flex h-screen overflow-hidden">

    <!-- ── Overlay mobile ─────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ── Sidebar ────────────────────────────────────────── -->
    <div
      class="fixed inset-y-0 left-0 z-50 bg-white transition-transform duration-300 ease-in-out
             lg:relative lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <EventsDashboardPanel
        :event-id="eventId"
        @close="sidebarOpen = false"
      />
    </div>

    <!-- ── Main ───────────────────────────────────────────── -->
    <main class="flex flex-1 flex-col overflow-hidden bg-[var(--color-background-tertiary)]">

      <!-- Topbar mobile uniquement -->
      <div class="flex shrink-0 items-center gap-3 border-b border-default
                  bg-background px-4 py-3 lg:hidden">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-menu"
          @click="sidebarOpen = true"
        />
        <p class="truncate text-sm font-medium text-highlighted">
          Gestion de l'événement
        </p>
      </div>

      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>

  </div>
</template>
