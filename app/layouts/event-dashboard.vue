<script setup lang="ts">
const route   = useRoute()
const eventId = computed(() => Number(route.params.id))
const isOpen  = ref(false)

watch(() => route.path, () => { isOpen.value = false })
</script>

<template>
  <div class="relative flex h-screen overflow-hidden">

    <!-- ── Overlay mobile ─────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 lg:hidden"

        @click="isOpen = false"
      />
    </Transition>

    <!-- ── Sidebar mobile ─────────────────────────────────── -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-in-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in-out"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-y-0 left-0 shadow-xl  lg:hidden bg-default  z-50"
      >
        <EventsDashboardPanel
          :event-id="eventId"
          @close="isOpen = false"
        />
      </div>
    </Transition>

    <!-- ── Sidebar desktop ────────────────────────────────── -->
    <div
      class="hidden lg:block flex-shrink-0"
      style="width: 280px"
    >
      <EventsDashboardPanel :event-id="eventId" />
    </div>

    <!-- ── Main ───────────────────────────────────────────── -->
    <main class="flex flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">

      <!-- Topbar mobile -->
      <div class="flex shrink-0 items-center gap-3 border-b border-default bg-background px-4 py-3 lg:hidden">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-panel-left"
          @click="isOpen = true"
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
