<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Button, Avatar } from 'primevue'
import useAuthStore from '@/stores/useAuthStore'

const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
  (e: 'close-mobile'): void
}>()

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { label: 'Dashboard', icon: 'pi-home',        to: '/' },
  { label: 'Analytics', icon: 'pi-chart-bar',   to: '/analytics' },
  { label: 'Users',     icon: 'pi-users',        to: '/users' },
  { label: 'Projects',  icon: 'pi-briefcase',    to: '/projects' },
  { label: 'Messages',  icon: 'pi-envelope',     to: '/messages', badge: 4 },
  { label: 'Calendar',  icon: 'pi-calendar',     to: '/calendar' },
  { label: 'Settings',  icon: 'pi-cog',          to: '/settings' },
]

const isActive = (to: string) => route.path === to

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{
      'sidebar--collapsed': collapsed,
      'sidebar--mobile-open': mobileOpen,
    }"
  >
    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-icon">
        <i class="pi pi-bolt"></i>
      </div>
      <Transition name="slide-fade">
        <span v-if="!collapsed" class="sidebar__logo-text">MyApp</span>
      </Transition>
      <Button
        class="sidebar__collapse-btn"
        text
        rounded
        severity="secondary"
        :icon="collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
        @click="emit('toggle-collapse')"
      />
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <ul class="sidebar__nav-list">
        <li v-for="item in navItems" :key="item.to">
          <router-link
            :to="item.to"
            class="sidebar__nav-item"
            :class="{ 'sidebar__nav-item--active': isActive(item.to) }"
            @click="emit('close-mobile')"
          >
            <span class="sidebar__nav-icon-wrap">
              <i :class="`pi ${item.icon}`"></i>
              <span v-if="item.badge" class="sidebar__badge">{{ item.badge }}</span>
            </span>
            <Transition name="slide-fade">
              <span v-if="!collapsed" class="sidebar__nav-label">{{ item.label }}</span>
            </Transition>
            <Transition name="slide-fade">
              <span v-if="!collapsed && item.badge" class="sidebar__badge-inline">{{ item.badge }}</span>
            </Transition>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- User section -->
    <div class="sidebar__user">
      <div class="sidebar__user-info">
        <Avatar
          :label="auth.user?.name?.charAt(0)?.toUpperCase() || 'U'"
          shape="circle"
          class="sidebar__avatar"
        />
        <Transition name="slide-fade">
          <div v-if="!collapsed" class="sidebar__user-details">
            <span class="sidebar__user-name">{{ auth.user?.name || 'User' }}</span>
            <span class="sidebar__user-email">{{ auth.user?.email || '' }}</span>
          </div>
        </Transition>
      </div>
      <Transition name="slide-fade">
        <Button
          v-if="!collapsed"
          icon="pi pi-sign-out"
          text
          rounded
          severity="secondary"
          class="sidebar__logout-btn"
          v-tooltip.right="'Logout'"
          @click="logout"
        />
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--p-surface-0);
  border-right: 1px solid var(--p-surface-200);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
  z-index: 200;
}

.sidebar--collapsed {
  width: 68px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    width: 240px !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  }
  .sidebar--mobile-open {
    transform: translateX(0);
  }
}

/* ─── Logo ─────────────────────────────────────────── */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--p-surface-100);
  min-height: 64px;
}

.sidebar__logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--p-primary-600);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--p-surface-900);
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
}

.sidebar__collapse-btn {
  margin-left: auto;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

/* ─── Nav ──────────────────────────────────────────── */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem 0.5rem;
}

.sidebar__nav::-webkit-scrollbar { width: 4px; }
.sidebar__nav::-webkit-scrollbar-track { background: transparent; }
.sidebar__nav::-webkit-scrollbar-thumb { background: var(--p-surface-200); border-radius: 2px; }

.sidebar__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  color: var(--p-surface-600);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.18s ease;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.sidebar__nav-item:hover {
  background: var(--p-surface-100);
  color: var(--p-surface-900);
}

.sidebar__nav-item--active {
  background: var(--p-primary-50);
  color: var(--p-primary-700);
}

.sidebar__nav-item--active:hover {
  background: var(--p-primary-100);
}

.sidebar__nav-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.sidebar__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--p-red-500);
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.sidebar__nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__badge-inline {
  margin-left: auto;
  background: var(--p-red-500);
  color: white;
  border-radius: 20px;
  padding: 1px 7px;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* ─── User ─────────────────────────────────────────── */
.sidebar__user {
  padding: 0.75rem;
  border-top: 1px solid var(--p-surface-100);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.sidebar__user-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  overflow: hidden;
}

.sidebar__avatar {
  flex-shrink: 0;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  font-weight: 700;
}

.sidebar__user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar__user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-surface-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-email {
  font-size: 0.75rem;
  color: var(--p-surface-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__logout-btn {
  flex-shrink: 0;
}

/* ─── Transitions ──────────────────────────────────── */
.slide-fade-enter-active { transition: all 0.2s ease; }
.slide-fade-leave-active { transition: all 0.15s ease; }
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
