<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'primevue'

const stats = [
  { label: 'Total Revenue',  value: '$48,295',  change: '+12.5%', up: true,  icon: 'pi-dollar',     color: 'green'  },
  { label: 'Active Users',   value: '3,842',    change: '+8.1%',  up: true,  icon: 'pi-users',      color: 'blue'   },
  { label: 'New Orders',     value: '1,204',    change: '-2.3%',  up: false, icon: 'pi-shopping-bag', color: 'orange' },
  { label: 'Pending Tasks',  value: '37',       change: '+5',     up: false, icon: 'pi-list-check', color: 'purple' },
]

const recentActivity = [
  { user: 'Alice Martin',   action: 'Created a new project',    time: '2 min ago',  avatar: 'A' },
  { user: 'Bob Johnson',    action: 'Uploaded 3 files',         time: '14 min ago', avatar: 'B' },
  { user: 'Claire Dupont',  action: 'Left a comment on #42',    time: '1 hr ago',   avatar: 'C' },
  { user: 'David Kim',      action: 'Completed task: Design',   time: '3 hr ago',   avatar: 'D' },
  { user: 'Emma Wilson',    action: 'Joined the workspace',     time: 'Yesterday',  avatar: 'E' },
]

const tasks = ref([
  { label: 'Update landing page copy',  done: false, priority: 'high'   },
  { label: 'Review pull request #87',   done: true,  priority: 'medium' },
  { label: 'Prepare Q2 report',         done: false, priority: 'high'   },
  { label: 'Fix authentication bug',    done: false, priority: 'low'    },
  { label: 'Team sync meeting',         done: true,  priority: 'medium' },
])

const priorityClass = (p: string) => ({
  high:   'badge--red',
  medium: 'badge--orange',
  low:    'badge--green',
})[p] || ''
</script>

<template>
  <div class="dashboard">

    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div>
        <h2 class="welcome-banner__title">Good morning 👋</h2>
        <p class="welcome-banner__sub">Here's what's happening with your projects today.</p>
      </div>
      <Button label="New Project" icon="pi pi-plus" class="welcome-banner__btn" />
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        :class="`stat-card--${stat.color}`"
      >
        <div class="stat-card__icon-wrap">
          <i :class="`pi ${stat.icon}`"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">{{ stat.label }}</span>
          <span class="stat-card__value">{{ stat.value }}</span>
          <span class="stat-card__change" :class="stat.up ? 'stat-card__change--up' : 'stat-card__change--down'">
            <i :class="`pi ${stat.up ? 'pi-arrow-up' : 'pi-arrow-down'}`"></i>
            {{ stat.change }} vs last month
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom grid: activity + tasks -->
    <div class="content-grid">

      <!-- Recent activity -->
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Recent Activity</h3>
          <a href="#" class="panel__link">View all</a>
        </div>
        <div class="activity-list">
          <div v-for="item in recentActivity" :key="item.user" class="activity-item">
            <div class="activity-item__avatar">{{ item.avatar }}</div>
            <div class="activity-item__content">
              <span class="activity-item__user">{{ item.user }}</span>
              <span class="activity-item__action">{{ item.action }}</span>
            </div>
            <span class="activity-item__time">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <!-- Tasks -->
      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">My Tasks</h3>
          <Button label="Add task" icon="pi pi-plus" text size="small" />
        </div>
        <div class="task-list">
          <div v-for="task in tasks" :key="task.label" class="task-item" :class="{ 'task-item--done': task.done }">
            <div class="task-item__check" :class="{ 'task-item__check--checked': task.done }" @click="task.done = !task.done">
              <i v-if="task.done" class="pi pi-check"></i>
            </div>
            <span class="task-item__label">{{ task.label }}</span>
            <span class="badge" :class="priorityClass(task.priority)">{{ task.priority }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Welcome */
.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.welcome-banner__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-surface-900);
  margin: 0 0 0.25rem;
}
.welcome-banner__sub {
  color: var(--p-surface-500);
  margin: 0;
  font-size: 0.9rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--p-surface-0);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid var(--p-surface-200);
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.stat-card__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stat-card--green  .stat-card__icon-wrap { background: #dcfce7; color: #16a34a; }
.stat-card--blue   .stat-card__icon-wrap { background: #dbeafe; color: #2563eb; }
.stat-card--orange .stat-card__icon-wrap { background: #ffedd5; color: #ea580c; }
.stat-card--purple .stat-card__icon-wrap { background: #ede9fe; color: #7c3aed; }

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-card__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-surface-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-surface-900);
  line-height: 1.2;
}
.stat-card__change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.stat-card__change--up   { color: #16a34a; }
.stat-card__change--down { color: #dc2626; }

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 900px) {
  .content-grid { grid-template-columns: 1fr 1fr; }
}

/* Panel */
.panel {
  background: var(--p-surface-0);
  border-radius: 14px;
  border: 1px solid var(--p-surface-200);
  overflow: hidden;
}
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--p-surface-100);
}
.panel__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--p-surface-800);
  margin: 0;
}
.panel__link {
  font-size: 0.8rem;
  color: var(--p-primary-600);
  text-decoration: none;
}
.panel__link:hover { text-decoration: underline; }

/* Activity */
.activity-list {
  padding: 0.5rem 0;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  transition: background 0.15s;
}
.activity-item:hover { background: var(--p-surface-50); }
.activity-item__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.activity-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.activity-item__user {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-surface-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.activity-item__action {
  font-size: 0.78rem;
  color: var(--p-surface-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.activity-item__time {
  font-size: 0.75rem;
  color: var(--p-surface-400);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Tasks */
.task-list {
  padding: 0.5rem 0;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  transition: background 0.15s;
}
.task-item:hover { background: var(--p-surface-50); }
.task-item--done .task-item__label {
  text-decoration: line-through;
  color: var(--p-surface-400);
}
.task-item__check {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--p-surface-300);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  font-size: 0.65rem;
}
.task-item__check--checked {
  background: var(--p-primary-600);
  border-color: var(--p-primary-600);
  color: white;
}
.task-item__label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--p-surface-700);
}

/* Badges */
.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: capitalize;
  flex-shrink: 0;
}
.badge--red    { background: #fee2e2; color: #dc2626; }
.badge--orange { background: #ffedd5; color: #ea580c; }
.badge--green  { background: #dcfce7; color: #16a34a; }
</style>
