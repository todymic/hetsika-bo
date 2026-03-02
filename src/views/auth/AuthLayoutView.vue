<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
</script>

<template>
  <div class="auth-root">
    <div class="auth-brand">
      <div class="auth-brand__inner">
        <div class="auth-brand__logo">
          <div class="auth-brand__logo-icon"><i class="pi pi-bolt"></i></div>
          <span class="auth-brand__logo-name">{{ t('app.name') }}</span>
        </div>

        <div class="auth-brand__hero">
          <h1 class="auth-brand__headline">
            {{ t('auth.layout.headline_1') }}<br>
            <span class="auth-brand__accent">{{ t('auth.layout.headline_accent') }}</span>
          </h1>
          <p class="auth-brand__desc">{{ t('auth.layout.description') }}</p>
        </div>

        <ul class="auth-brand__features">
          <li v-for="(feature, i) in (tm('auth.layout.features') as string[])" :key="i">
            <span class="auth-brand__feature-check"><i class="pi pi-check" /></span>
            {{ feature }}
          </li>
        </ul>

        <div class="auth-brand__deco auth-brand__deco--1" />
        <div class="auth-brand__deco auth-brand__deco--2" />
        <div class="auth-brand__deco auth-brand__deco--3" />
      </div>
    </div>

    <div class="auth-form-panel">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-root { display: flex; min-height: 100vh; }

.auth-brand {
  display: none;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, var(--p-primary-800) 0%, var(--p-primary-600) 50%, color-mix(in srgb, var(--p-primary-500) 80%, #818cf8) 100%);
}
@media (min-width: 1024px) { .auth-brand { display: flex; flex: 1.1; max-width: 560px; } }

.auth-brand__inner {
  position: relative; z-index: 2; padding: 3rem;
  display: flex; flex-direction: column; gap: 2.5rem; color: white; width: 100%;
}
.auth-brand__logo { display: flex; align-items: center; gap: 0.65rem; }
.auth-brand__logo-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center; font-size: 1rem;
}
.auth-brand__logo-name { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; }
.auth-brand__hero { margin-top: auto; }
.auth-brand__headline { font-size: 2.4rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin: 0 0 1rem; }
.auth-brand__accent { color: color-mix(in srgb, white 85%, var(--p-primary-200)); }
.auth-brand__desc { font-size: 1rem; opacity: 0.8; line-height: 1.7; margin: 0; max-width: 380px; }
.auth-brand__features { list-style: none; margin: 0 0 auto; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.auth-brand__features li { display: flex; align-items: center; gap: 0.7rem; font-size: 0.9rem; opacity: 0.9; }
.auth-brand__feature-check {
  width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 0.6rem; flex-shrink: 0;
}
.auth-brand__deco { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; z-index: 1; }
.auth-brand__deco--1 { width: 380px; height: 380px; top: -120px; right: -100px; }
.auth-brand__deco--2 { width: 260px; height: 260px; bottom: 60px; right: -60px; background: rgba(255,255,255,0.04); }
.auth-brand__deco--3 { width: 160px; height: 160px; bottom: -40px; left: 80px; background: rgba(255,255,255,0.05); }

.auth-form-panel {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 2rem 1.5rem; background: var(--p-surface-50); min-height: 100vh;
}
</style>
