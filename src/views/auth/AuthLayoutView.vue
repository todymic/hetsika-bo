<template>
  <div class="auth-layout">
    <!-- Left panel - branding -->
    <div class="auth-layout__branding">
      <div class="auth-layout__branding-content">
        <div class="auth-layout__logo">
          <i class="pi pi-bolt text-4xl text-white"></i>
        </div>
        <h1 class="auth-layout__title">MyApp</h1>
        <p class="auth-layout__subtitle">
          The all-in-one platform to manage your business efficiently.
        </p>
        <div class="auth-layout__features">
          <div class="auth-layout__feature" v-for="feat in features" :key="feat.text">
            <i :class="`pi ${feat.icon}`"></i>
            <span>{{ feat.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel - form -->
    <div class="auth-layout__form-panel">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: 'pi-check-circle', text: 'Powerful analytics dashboard' },
  { icon: 'pi-check-circle', text: 'Team collaboration tools' },
  { icon: 'pi-check-circle', text: 'Secure and reliable platform' },
]
</script>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--p-surface-50);
}

/* Left branding panel */
.auth-layout__branding {
  display: none;
  flex: 1;
  background: linear-gradient(135deg, var(--p-primary-600) 0%, var(--p-primary-900) 100%);
  padding: 3rem;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-layout__branding::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  top: -100px;
  right: -100px;
}

.auth-layout__branding::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  bottom: -80px;
  left: -80px;
}

@media (min-width: 1024px) {
  .auth-layout__branding {
    display: flex;
  }
}

.auth-layout__branding-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
  color: white;
}

.auth-layout__logo {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.auth-layout__title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: white;
}

.auth-layout__subtitle {
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.7;
  margin: 0 0 2rem;
}

.auth-layout__features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-layout__feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.auth-layout__feature i {
  color: rgba(255,255,255,0.8);
  font-size: 1rem;
}

/* Right form panel */
.auth-layout__form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .auth-layout__form-panel {
    max-width: 540px;
  }
}
</style>
