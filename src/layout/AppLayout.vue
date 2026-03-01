<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Avatar } from 'primevue'
import useAuthStore from '@/stores/useAuthStore'
import AppSidebar from '@/layout/AppSidebar.vue'

const route = useRoute()
const auth = useAuthStore()

const collapsed = ref(false)
const mobileOpen = ref(false)

const toggleMobile = () => { mobileOpen.value = !mobileOpen.value }
const closeMobile = () => { mobileOpen.value = false }
</script>

<template>
  <div class="dashboard-layout" :class="{ 'sidebar-collapsed': collapsed }">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div v-if="mobileOpen" class="mobile-overlay" @click="closeMobile" />
    </Transition>

    <!-- Sidebar -->
    <AppSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @toggle-collapse="collapsed = !collapsed"
      @close-mobile="closeMobile"
    />

    <!-- Main content area -->
    <div class="main-wrapper">
      <!-- Topbar -->
      <header class="topbar">
        <Button
          class="topbar__menu-btn"
          text
          rounded
          severity="secondary"
          icon="pi pi-bars"
          @click="toggleMobile"
        />

        <div class="topbar__title">
          <h1>{{ route.meta?.title || 'Dashboard' }}</h1>
        </div>

        <div class="topbar__actions">
          <Button text rounded severity="secondary" class="topbar__action-btn">
            <template #default>
              <i class="pi pi-bell"></i>
              <span class="topbar__notif-dot"></span>
            </template>
          </Button>
          <Button icon="pi pi-search" text rounded severity="secondary" class="topbar__action-btn" />
          <Avatar
            :label="auth.user?.name?.charAt(0)?.toUpperCase() || 'U'"
            shape="circle"
            class="topbar__avatar"
          />
        </div>
      </header>

      <!-- Page content -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--p-surface-50);
  --topbar-height: 64px;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ─── Topbar ───────────────────────────────────────── */
.topbar {
  height: var(--topbar-height);
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  gap: 1rem;
  flex-shrink: 0;
}

.topbar__menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .topbar__menu-btn {
    display: flex;
  }
}

.topbar__title h1 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-surface-800);
  margin: 0;
}

.topbar__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.topbar__action-btn {
  position: relative;
}

.topbar__notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--p-red-500);
  border-radius: 50%;
  border: 2px solid var(--p-surface-0);
}

.topbar__avatar {
  margin-left: 0.5rem;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  font-weight: 700;
  cursor: pointer;
}

/* ─── Main content ─────────────────────────────────── */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.75rem;
}

@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }
}

/* ─── Mobile overlay ───────────────────────────────── */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 199;
  backdrop-filter: blur(2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
