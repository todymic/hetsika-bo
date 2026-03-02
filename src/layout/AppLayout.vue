<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Avatar, Breadcrumb } from 'primevue'
import { useI18n } from 'vue-i18n'
import useAuthStore from '@/stores/useAuthStore'
import AppSidebar from '@/layout/AppSidebar.vue'

const { t } = useI18n()
const route  = useRoute()
const auth   = useAuthStore()

const collapsed  = ref(false)
const mobileOpen = ref(false)

const toggleMobile = () => { mobileOpen.value = !mobileOpen.value }
const closeMobile  = () => { mobileOpen.value = false }

const breadcrumbHome  = { icon: 'pi pi-home', to: '/' }
const breadcrumbItems = [{ label: route.meta?.title as string || t('dashboard.title') }]
</script>

<template>
  <div class="layout-root">
    <Transition name="overlay-fade">
      <div v-if="mobileOpen" class="layout-overlay" @click="closeMobile" />
    </Transition>

    <AppSidebar :collapsed="collapsed" :mobile-open="mobileOpen" @toggle-collapse="collapsed = !collapsed" @close-mobile="closeMobile" />

    <div class="layout-main">
      <header class="topbar">
        <Button icon="pi pi-bars" text rounded severity="secondary" class="topbar__burger" @click="toggleMobile" />

        <div class="topbar__breadcrumb">
          <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>

        <div class="topbar__right">
          <div class="topbar__search">
            <i class="pi pi-search topbar__search-icon" />
            <input class="topbar__search-input" :placeholder="t('topbar.search_placeholder')" type="text" />
            <span class="topbar__search-kbd">⌘K</span>
          </div>

          <div class="topbar__actions">
            <button class="topbar__icon-btn" :aria-label="t('topbar.notifications')">
              <i class="pi pi-bell" />
              <span class="topbar__notif-badge">3</span>
            </button>
            <button class="topbar__icon-btn" :aria-label="t('topbar.settings')">
              <i class="pi pi-cog" />
            </button>
            <div class="topbar__profile">
              <Avatar :label="auth.user?.fullName?.charAt(0)?.toUpperCase() || 'U'" shape="circle" class="topbar__avatar" />
              <div class="topbar__profile-info">
                <span class="topbar__profile-name">{{ auth.user?.fullName  || 'User' }}</span>
                <span class="topbar__profile-role">{{ t('topbar.role') }}</span>
              </div>
              <i class="pi pi-chevron-down topbar__profile-caret" />
            </div>
          </div>
        </div>
      </header>

      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-root { display: flex; height: 100vh; overflow: hidden; background: var(--p-surface-50); }
.layout-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.topbar { height: 64px; background: var(--p-surface-0); border-bottom: 1px solid var(--p-surface-200); display: flex; align-items: center; padding: 0 1.25rem; gap: 1rem; flex-shrink: 0; }
.topbar__burger { display: none; }
@media (max-width: 768px) { .topbar__burger { display: flex; } }
.topbar__breadcrumb :deep(.p-breadcrumb) { background: transparent; border: none; padding: 0; font-size: 0.875rem; }
.topbar__right { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }
.topbar__search { display: none; align-items: center; gap: 0.5rem; background: var(--p-surface-100); border: 1px solid var(--p-surface-200); border-radius: 8px; padding: 0.4rem 0.75rem; transition: border-color 0.15s, box-shadow 0.15s; }
.topbar__search:focus-within { border-color: var(--p-primary-400); box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-400) 15%, transparent); background: var(--p-surface-0); }
@media (min-width: 640px) { .topbar__search { display: flex; } }
.topbar__search-icon { color: var(--p-surface-400); font-size: 0.85rem; }
.topbar__search-input { border: none; outline: none; background: transparent; font-size: 0.85rem; color: var(--p-surface-800); width: 160px; font-family: inherit; }
.topbar__search-input::placeholder { color: var(--p-surface-400); }
.topbar__search-kbd { font-size: 0.7rem; color: var(--p-surface-400); background: var(--p-surface-200); border-radius: 4px; padding: 1px 5px; white-space: nowrap; }
.topbar__actions { display: flex; align-items: center; gap: 0.25rem; }
.topbar__icon-btn { position: relative; width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent; color: var(--p-surface-500); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: background 0.15s, color 0.15s; }
.topbar__icon-btn:hover { background: var(--p-surface-100); color: var(--p-surface-800); }
.topbar__notif-badge { position: absolute; top: 4px; right: 4px; background: var(--p-red-500); color: white; border-radius: 50%; width: 14px; height: 14px; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--p-surface-0); }
.topbar__profile { display: flex; align-items: center; gap: 0.6rem; padding: 0.3rem 0.6rem 0.3rem 0.3rem; border-radius: 10px; cursor: pointer; transition: background 0.15s; border: 1px solid transparent; }
.topbar__profile:hover { background: var(--p-surface-100); border-color: var(--p-surface-200); }
.topbar__avatar { width: 32px !important; height: 32px !important; font-size: 0.8rem !important; background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200)); color: var(--p-primary-700); font-weight: 700; }
.topbar__profile-info { display: none; flex-direction: column; }
@media (min-width: 900px) { .topbar__profile-info { display: flex; } }
.topbar__profile-name { font-size: 0.82rem; font-weight: 600; color: var(--p-surface-800); line-height: 1.2; white-space: nowrap; }
.topbar__profile-role { font-size: 0.7rem; color: var(--p-surface-400); white-space: nowrap; }
.topbar__profile-caret { font-size: 0.65rem; color: var(--p-surface-400); display: none; }
@media (min-width: 900px) { .topbar__profile-caret { display: block; } }
.layout-content { flex: 1; overflow-y: auto; padding: 1.5rem 2rem; }
@media (max-width: 640px) { .layout-content { padding: 1rem; } }
.layout-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(3px); z-index: 199; }
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.22s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
</style>
