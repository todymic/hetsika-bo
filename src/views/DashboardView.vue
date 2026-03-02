<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, Tag } from 'primevue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const stats = computed(() => [
  { label: t('dashboard.stats.revenue'),      value: '48 295 €', change: '+12.5%', up: true,  icon: 'pi-wallet',       color: '#6366f1', bg: '#eef2ff' },
  { label: t('dashboard.stats.active_users'), value: '3 842',    change: '+8.1%',  up: true,  icon: 'pi-users',        color: '#0ea5e9', bg: '#e0f2fe' },
  { label: t('dashboard.stats.new_orders'),   value: '1 204',    change: '-2.3%',  up: false, icon: 'pi-shopping-bag', color: '#f59e0b', bg: '#fffbeb' },
  { label: t('dashboard.stats.conversion'),   value: '5.27%',    change: '+0.4%',  up: true,  icon: 'pi-chart-line',   color: '#10b981', bg: '#ecfdf5' },
])

const recentActivity = computed(() => [
  { user: 'Alice Martin',  action: t('dashboard.activity.items.created_project'), time: '2 min',     avatar: 'A', color: '#6366f1' },
  { user: 'Bob Johnson',   action: t('dashboard.activity.items.uploaded_files'),  time: '14 min',    avatar: 'B', color: '#0ea5e9' },
  { user: 'Claire Dupont', action: t('dashboard.activity.items.left_comment'),    time: '1 h',       avatar: 'C', color: '#f59e0b' },
  { user: 'David Kim',     action: t('dashboard.activity.items.completed_task'),  time: '3 h',       avatar: 'D', color: '#10b981' },
  { user: 'Emma Wilson',   action: t('dashboard.activity.items.joined'),          time: 'Hier',      avatar: 'E', color: '#ec4899' },
])

const projects = computed(() => [
  { name: 'Website Redesign', progress: 72, status: t('dashboard.projects.status.on_track'),  color: '#6366f1' },
  { name: 'Mobile App v2',    progress: 45, status: t('dashboard.projects.status.at_risk'),   color: '#f59e0b' },
  { name: 'API Integration',  progress: 90, status: t('dashboard.projects.status.completed'), color: '#10b981' },
  { name: 'Data Migration',   progress: 28, status: t('dashboard.projects.status.delayed'),   color: '#ef4444' },
])

const tasks = ref([
  { labelKey: 'dashboard.tasks.items.update_landing', done: false, priority: 'high'   },
  { labelKey: 'dashboard.tasks.items.review_pr',      done: true,  priority: 'medium' },
  { labelKey: 'dashboard.tasks.items.prepare_report', done: false, priority: 'high'   },
  { labelKey: 'dashboard.tasks.items.fix_auth',       done: false, priority: 'low'    },
  { labelKey: 'dashboard.tasks.items.team_sync',      done: true,  priority: 'medium' },
])

const remainingCount = computed(() => tasks.value.filter(t => !t.done).length)

const statusSeverity: Record<string, string> = {
  'En bonne voie': 'success',
  'Terminé':       'success',
  'À risque':      'warn',
  'En retard':     'danger',
}
const prioritySeverity: Record<string, string> = {
  high:   'danger',
  medium: 'warn',
  low:    'success',
}
const priorityLabel = (p: string) => t(`dashboard.tasks.priority.${p}`)
</script>

<template>
  <div class="dashboard">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-header__title">{{ t('dashboard.title') }}</h1>
        <p class="page-header__sub">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="page-header__actions">
        <Button :label="t('dashboard.export')"      icon="pi pi-download" outlined severity="secondary" size="small" />
        <Button :label="t('dashboard.new_project')" icon="pi pi-plus"                                   size="small" />
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-card__top">
          <span class="stat-card__label">{{ stat.label }}</span>
          <div class="stat-card__icon" :style="{ background: stat.bg, color: stat.color }">
            <i :class="`pi ${stat.icon}`" />
          </div>
        </div>
        <div class="stat-card__value">{{ stat.value }}</div>
        <div class="stat-card__footer">
          <span class="stat-card__change" :class="stat.up ? 'stat-card__change--up' : 'stat-card__change--down'">
            <i :class="`pi ${stat.up ? 'pi-arrow-up-right' : 'pi-arrow-down-right'}`" />{{ stat.change }}
          </span>
          <span class="stat-card__period">{{ t('dashboard.vs_last_month') }}</span>
        </div>
      </div>
    </div>

    <!-- Middle row -->
    <div class="mid-row">
      <!-- Projects -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">{{ t('dashboard.projects.title') }}</h3>
            <p class="card__sub">{{ t('dashboard.projects.subtitle') }}</p>
          </div>
          <Button :label="t('dashboard.projects.view_all')" text size="small" icon="pi pi-arrow-right" iconPos="right" />
        </div>
        <div class="projects-list">
          <div v-for="proj in projects" :key="proj.name" class="project-item">
            <div class="project-item__head">
              <div class="project-item__dot" :style="{ background: proj.color }" />
              <span class="project-item__name">{{ proj.name }}</span>
              <Tag :value="proj.status" :severity="statusSeverity[proj.status]" class="project-item__tag" />
            </div>
            <div class="project-item__progress-wrap">
              <div class="project-item__progress-bar">
                <div class="project-item__progress-fill" :style="{ width: proj.progress + '%', background: proj.color }" />
              </div>
              <span class="project-item__pct">{{ proj.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">{{ t('dashboard.activity.title') }}</h3>
            <p class="card__sub">{{ t('dashboard.activity.subtitle') }}</p>
          </div>
          <Button :label="t('dashboard.activity.view_all')" text size="small" icon="pi pi-arrow-right" iconPos="right" />
        </div>
        <div class="activity-feed">
          <div v-for="(item, i) in recentActivity" :key="item.user" class="activity-item">
            <div class="activity-item__line-wrap">
              <div class="activity-item__avatar" :style="{ background: item.color + '22', color: item.color }">{{ item.avatar }}</div>
              <div v-if="i < recentActivity.length - 1" class="activity-item__connector" />
            </div>
            <div class="activity-item__body">
              <div class="activity-item__row">
                <span class="activity-item__user">{{ item.user }}</span>
                <span class="activity-item__time">{{ item.time }}</span>
              </div>
              <span class="activity-item__action">{{ item.action }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks -->
    <div class="card">
      <div class="card__header">
        <div>
          <h3 class="card__title">{{ t('dashboard.tasks.title') }}</h3>
          <p class="card__sub">{{ remainingCount }} {{ t('dashboard.tasks.remaining', remainingCount) }}</p>
        </div>
        <Button :label="t('dashboard.tasks.add')" icon="pi pi-plus" outlined size="small" severity="secondary" />
      </div>
      <div class="tasks-grid">
        <div
          v-for="task in tasks" :key="task.labelKey"
          class="task-item" :class="{ 'task-item--done': task.done }"
          @click="task.done = !task.done"
        >
          <div class="task-item__check" :class="{ 'task-item__check--active': task.done }">
            <Transition name="check-pop">
              <i v-if="task.done" class="pi pi-check" />
            </Transition>
          </div>
          <span class="task-item__label">{{ t(task.labelKey) }}</span>
          <Tag :value="priorityLabel(task.priority)" :severity="prioritySeverity[task.priority]" class="task-item__priority" />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.page-header__title { font-size: 1.4rem; font-weight: 700; color: var(--p-surface-900); letter-spacing: -0.02em; margin: 0 0 0.2rem; }
.page-header__sub { font-size: 0.875rem; color: var(--p-surface-500); margin: 0; }
.page-header__actions { display: flex; gap: 0.5rem; align-items: center; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.stat-card { background: var(--p-surface-0); border: 1px solid var(--p-surface-200); border-radius: 12px; padding: 1.25rem; transition: box-shadow 0.2s, transform 0.2s; }
.stat-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.07); transform: translateY(-1px); }
.stat-card__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.stat-card__label { font-size: 0.78rem; font-weight: 600; color: var(--p-surface-500); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card__icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
.stat-card__value { font-size: 1.65rem; font-weight: 700; color: var(--p-surface-900); letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 0.5rem; }
.stat-card__footer { display: flex; align-items: center; gap: 0.4rem; }
.stat-card__change { display: flex; align-items: center; gap: 0.2rem; font-size: 0.78rem; font-weight: 600; }
.stat-card__change--up { color: #10b981; }
.stat-card__change--down { color: #ef4444; }
.stat-card__period { font-size: 0.75rem; color: var(--p-surface-400); }
.card { background: var(--p-surface-0); border: 1px solid var(--p-surface-200); border-radius: 12px; overflow: hidden; }
.card__header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.35rem; border-bottom: 1px solid var(--p-surface-100); }
.card__title { font-size: 0.95rem; font-weight: 700; color: var(--p-surface-900); margin: 0 0 0.1rem; letter-spacing: -0.01em; }
.card__sub { font-size: 0.78rem; color: var(--p-surface-400); margin: 0; }
.mid-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 900px) { .mid-row { grid-template-columns: 1.3fr 1fr; } }
.projects-list { padding: 0.6rem 0; }
.project-item { padding: 0.8rem 1.35rem; transition: background 0.15s; }
.project-item:hover { background: var(--p-surface-50); }
.project-item__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.55rem; }
.project-item__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.project-item__name { flex: 1; font-size: 0.875rem; font-weight: 500; color: var(--p-surface-800); }
.project-item__tag { font-size: 0.7rem !important; }
.project-item__progress-wrap { display: flex; align-items: center; gap: 0.65rem; }
.project-item__progress-bar { flex: 1; height: 5px; background: var(--p-surface-100); border-radius: 99px; overflow: hidden; }
.project-item__progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.project-item__pct { font-size: 0.75rem; font-weight: 600; color: var(--p-surface-500); min-width: 32px; text-align: right; }
.activity-feed { padding: 0.75rem 1.35rem; display: flex; flex-direction: column; }
.activity-item { display: flex; gap: 0.85rem; }
.activity-item__line-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.activity-item__avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
.activity-item__connector { width: 1px; flex: 1; min-height: 16px; background: var(--p-surface-200); margin: 3px 0; }
.activity-item__body { flex: 1; padding-bottom: 1rem; }
.activity-item:last-child .activity-item__body { padding-bottom: 0.25rem; }
.activity-item__row { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.15rem; }
.activity-item__user { font-size: 0.85rem; font-weight: 600; color: var(--p-surface-800); }
.activity-item__time { font-size: 0.73rem; color: var(--p-surface-400); white-space: nowrap; }
.activity-item__action { font-size: 0.8rem; color: var(--p-surface-500); }
.tasks-grid { padding: 0.5rem 0; }
.task-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.7rem 1.35rem; cursor: pointer; transition: background 0.12s; user-select: none; }
.task-item:hover { background: var(--p-surface-50); }
.task-item--done .task-item__label { text-decoration: line-through; color: var(--p-surface-400); }
.task-item__check { width: 18px; height: 18px; min-width: 18px; border-radius: 5px; border: 2px solid var(--p-surface-300); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; transition: all 0.15s; color: white; }
.task-item__check--active { background: var(--p-primary-500); border-color: var(--p-primary-500); }
.task-item__label { flex: 1; font-size: 0.875rem; color: var(--p-surface-700); }
.task-item__priority { font-size: 0.7rem !important; text-transform: capitalize; }
.check-pop-enter-active { transition: transform 0.15s cubic-bezier(.34,1.56,.64,1), opacity 0.1s; }
.check-pop-leave-active { transition: transform 0.1s ease, opacity 0.1s; }
.check-pop-enter-from, .check-pop-leave-to { transform: scale(0); opacity: 0; }
</style>
