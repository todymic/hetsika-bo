<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Button, Avatar } from 'primevue'
import { useI18n } from 'vue-i18n'
import useAuthStore from '@/stores/useAuthStore'

defineProps<{ collapsed: boolean; mobileOpen: boolean }>()
const emit = defineEmits<{
  (e: 'toggle-collapse'): void
  (e: 'close-mobile'): void
}>()

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const navGroups = [
  {
    labelKey: 'nav.groups.main',
    items: [
      { labelKey: 'nav.dashboard', icon: 'pi-home',      to: '/' },
      { labelKey: 'nav.analytics', icon: 'pi-chart-bar', to: '/analytics' },
    ]
  },
  {
    labelKey: 'nav.groups.management',
    items: [
      { labelKey: 'nav.users',    icon: 'pi-users',     to: '/users' },
      { labelKey: 'nav.projects', icon: 'pi-briefcase', to: '/projects' },
      { labelKey: 'nav.messages', icon: 'pi-envelope',  to: '/messages', badge: 4 },
      { labelKey: 'nav.calendar', icon: 'pi-calendar',  to: '/calendar' },
    ]
  },
  {
    labelKey: 'nav.groups.system',
    items: [
      { labelKey: 'nav.settings', icon: 'pi-cog',              to: '/settings' },
      { labelKey: 'nav.help',     icon: 'pi-question-circle',  to: '/help' },
    ]
  },
]

const isActive = (to: string) => route.path === to
const logout   = () => { auth.logout(); router.push('/auth/login') }
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed, 'sidebar--mobile-open': mobileOpen }">

    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-mark"><i class="pi pi-bolt"></i></div>
      <Transition name="label-fade">
        <span v-if="!collapsed" class="sidebar__logo-name">{{ t('app.name') }}</span>
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="sidebar__nav">
      <template v-for="group in navGroups" :key="group.labelKey">
        <Transition name="label-fade">
          <span v-if="!collapsed" class="sidebar__group-label">{{ t(group.labelKey) }}</span>
        </Transition>
        <div v-if="collapsed" class="sidebar__group-divider" />

        <ul class="sidebar__nav-list">
          <li v-for="item in group.items" :key="item.to">
            <router-link
              :to="item.to"
              class="sidebar__item"
              :class="{ 'sidebar__item--active': isActive(item.to) }"
              @click="emit('close-mobile')"
              v-tooltip.right="collapsed ? t(item.labelKey) : undefined"
            >
              <span class="sidebar__item-icon"><i :class="`pi ${item.icon}`" /></span>
              <Transition name="label-fade">
                <span v-if="!collapsed" class="sidebar__item-label">{{ t(item.labelKey) }}</span>
              </Transition>
              <Transition name="label-fade">
                <span v-if="!collapsed && item.badge" class="sidebar__item-badge">{{ item.badge }}</span>
              </Transition>
              <span v-if="collapsed && item.badge" class="sidebar__item-badge-dot" />
            </router-link>
          </li>
        </ul>
      </template>
    </div>

    <!-- Footer -->
    <div class="sidebar__footer">
      <div class="sidebar__user" v-tooltip.right="collapsed ? (auth.user?.fullName || 'User') : undefined">
        <Avatar :label="auth.user?.fullName?.charAt(0)?.toUpperCase() || 'U'" shape="circle" class="sidebar__user-avatar" />
        <Transition name="label-fade">
          <div v-if="!collapsed" class="sidebar__user-info">
            <span class="sidebar__user-name">{{ auth.user?.fullName || 'User' }}</span>
            <span class="sidebar__user-role">{{ t('sidebar.r:=ole') }}</span>
          </div>
        </Transition>
        <Transition name="label-fade">
          <Button v-if="!collapsed" icon="pi pi-sign-out" text rounded severity="secondary" size="small"
                  class="sidebar__logout" v-tooltip.top="t('sidebar.logout')" @click.prevent="logout" />
        </Transition>
      </div>

      <button class="sidebar__toggle" @click="emit('toggle-collapse')" :title="collapsed ? t('sidebar.expand') : t('sidebar.collapse')">
        <i :class="`pi ${collapsed ? 'pi-chevron-right' : 'pi-chevron-left'}`" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  --sidebar-w: 256px;
  --sidebar-collapsed-w: 70px;
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--p-surface-0);
  border-right: 1px solid var(--p-surface-200);
  display: flex; flex-direction: column; flex-shrink: 0;
  overflow: hidden; transition: width 0.22s cubic-bezier(.4,0,.2,1); z-index: 200;
}
.sidebar--collapsed { width: var(--sidebar-collapsed-w); }
@media (max-width: 768px) {
  .sidebar { position: fixed; inset: 0 auto 0 0; width: var(--sidebar-w) !important; transform: translateX(-100%); transition: transform 0.22s cubic-bezier(.4,0,.2,1); box-shadow: 8px 0 32px rgba(0,0,0,0.12); }
  .sidebar--mobile-open { transform: translateX(0); }
}
.sidebar__logo { display: flex; align-items: center; gap: 0.75rem; padding: 0 1rem; height: 64px; border-bottom: 1px solid var(--p-surface-200); flex-shrink: 0; overflow: hidden; }
.sidebar__logo-mark {
  width: 34px; height: 34px; min-width: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--p-primary-500), var(--p-primary-700));
  color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--p-primary-500) 40%, transparent);
}
.sidebar__logo-name { font-size: 1.05rem; font-weight: 700; color: var(--p-surface-900); white-space: nowrap; letter-spacing: -0.01em; }
.sidebar__nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1rem 0.6rem; display: flex; flex-direction: column; gap: 0.15rem; }
.sidebar__nav::-webkit-scrollbar { width: 3px; }
.sidebar__nav::-webkit-scrollbar-thumb { background: var(--p-surface-200); border-radius: 2px; }
.sidebar__group-label { display: block; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--p-surface-400); padding: 0.75rem 0.6rem 0.35rem; white-space: nowrap; }
.sidebar__group-divider { height: 1px; background: var(--p-surface-200); margin: 0.65rem 0.4rem; }
.sidebar__nav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.sidebar__item {
  display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.7rem; border-radius: 8px;
  text-decoration: none; color: var(--p-surface-600); font-size: 0.875rem; font-weight: 500;
  transition: background 0.15s, color 0.15s; cursor: pointer; overflow: hidden; white-space: nowrap;
  position: relative; border-left: 2px solid transparent;
}
.sidebar__item:hover { background: var(--p-surface-100); color: var(--p-surface-900); }
.sidebar__item--active { background: var(--p-primary-50); color: var(--p-primary-600); border-left-color: var(--p-primary-500); font-weight: 600; }
.sidebar__item--active:hover { background: color-mix(in srgb, var(--p-primary-100) 80%, transparent); }
.sidebar__item-icon { width: 18px; min-width: 18px; text-align: center; font-size: 0.95rem; }
.sidebar__item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.sidebar__item-badge { background: var(--p-primary-500); color: white; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 20px; min-width: 18px; text-align: center; flex-shrink: 0; }
.sidebar__item-badge-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; background: var(--p-primary-500); border-radius: 50%; border: 1.5px solid var(--p-surface-0); }
.sidebar__footer { border-top: 1px solid var(--p-surface-200); padding: 0.75rem 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; flex-shrink: 0; }
.sidebar__user { display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem; border-radius: 8px; overflow: hidden; cursor: default; transition: background 0.15s; }
.sidebar__user:hover { background: var(--p-surface-50); }
.sidebar__user-avatar { min-width: 32px; width: 32px; height: 32px; font-size: 0.8rem; background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200)); color: var(--p-primary-700); font-weight: 700; flex-shrink: 0; }
.sidebar__user-info { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.sidebar__user-name { font-size: 0.82rem; font-weight: 600; color: var(--p-surface-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.sidebar__user-role { font-size: 0.72rem; color: var(--p-surface-400); white-space: nowrap; }
.sidebar__logout { flex-shrink: 0; width: 28px !important; height: 28px !important; }
.sidebar__toggle { width: 100%; display: flex; align-items: center; justify-content: center; padding: 0.45rem; border-radius: 8px; border: 1px solid var(--p-surface-200); background: transparent; color: var(--p-surface-400); cursor: pointer; font-size: 0.7rem; transition: all 0.15s; }
.sidebar__toggle:hover { background: var(--p-surface-100); color: var(--p-surface-700); border-color: var(--p-surface-300); }
.label-fade-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; transition-delay: 0.05s; }
.label-fade-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.label-fade-enter-from, .label-fade-leave-to { opacity: 0; transform: translateX(-6px); }
</style>
