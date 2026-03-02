<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from 'primevue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found__bg">
      <div class="not-found__blob not-found__blob--1" />
      <div class="not-found__blob not-found__blob--2" />
    </div>

    <div class="not-found__content">
      <div class="not-found__number">
        <span class="not-found__four">4</span>
        <div class="not-found__zero"><i class="pi pi-search"></i></div>
        <span class="not-found__four">4</span>
      </div>

      <h1 class="not-found__title">{{ t('not_found.title') }}</h1>
      <p class="not-found__desc">{{ t('not_found.description') }}</p>

      <div class="not-found__actions">
        <Button :label="t('not_found.go_back')"      icon="pi pi-arrow-left" outlined severity="secondary" @click="router.back()" />
        <Button :label="t('not_found.go_dashboard')" icon="pi pi-home"                                     @click="router.push('/')" />
      </div>

      <div class="not-found__links">
        <span class="not-found__links-label">{{ t('not_found.quick_links') }}</span>
        <div class="not-found__links-grid">
          <router-link to="/"          class="not-found__link"><i class="pi pi-home" />{{ t('nav.dashboard') }}</router-link>
          <router-link to="/analytics" class="not-found__link"><i class="pi pi-chart-bar" />{{ t('nav.analytics') }}</router-link>
          <router-link to="/users"     class="not-found__link"><i class="pi pi-users" />{{ t('nav.users') }}</router-link>
          <router-link to="/settings"  class="not-found__link"><i class="pi pi-cog" />{{ t('nav.settings') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--p-surface-50); padding: 2rem; position: relative; overflow: hidden; }
.not-found__bg { position: absolute; inset: 0; pointer-events: none; }
.not-found__blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
.not-found__blob--1 { width: 600px; height: 600px; background: color-mix(in srgb, var(--p-primary-200) 40%, transparent); top: -200px; right: -200px; }
.not-found__blob--2 { width: 400px; height: 400px; background: color-mix(in srgb, var(--p-primary-100) 50%, transparent); bottom: -100px; left: -100px; }
.not-found__content { position: relative; z-index: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 480px; }
.not-found__number { display: flex; align-items: center; gap: 0.5rem; }
.not-found__four { font-size: 7rem; font-weight: 900; color: var(--p-surface-200); letter-spacing: -0.05em; line-height: 1; user-select: none; }
.not-found__zero { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200)); border: 4px solid var(--p-primary-300); display: flex; align-items: center; justify-content: center; color: var(--p-primary-600); font-size: 2rem; animation: spin-slow 8s linear infinite; }
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.not-found__title { font-size: 1.75rem; font-weight: 800; color: var(--p-surface-900); letter-spacing: -0.03em; margin: 0; }
.not-found__desc { font-size: 0.95rem; color: var(--p-surface-500); line-height: 1.65; margin: 0; }
.not-found__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
.not-found__links { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; width: 100%; }
.not-found__links-label { font-size: 0.75rem; font-weight: 600; color: var(--p-surface-400); text-transform: uppercase; letter-spacing: 0.06em; }
.not-found__links-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
.not-found__link { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; border-radius: 8px; border: 1px solid var(--p-surface-200); background: var(--p-surface-0); color: var(--p-surface-600); font-size: 0.82rem; font-weight: 500; text-decoration: none; transition: all 0.15s; }
.not-found__link:hover { background: var(--p-primary-50); border-color: var(--p-primary-200); color: var(--p-primary-700); }
.not-found__link .pi { font-size: 0.8rem; }
</style>
