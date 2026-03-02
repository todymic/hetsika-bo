<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const resent = ref(false)

const resendEmail = () => {
  resent.value = true
  setTimeout(() => { resent.value = false }, 5000)
}
</script>

<template>
  <div class="confirm-box">
    <div class="confirm-box__envelope">
      <div class="confirm-box__envelope-icon"><i class="pi pi-envelope"></i></div>
      <div class="confirm-box__envelope-dot confirm-box__envelope-dot--1" />
      <div class="confirm-box__envelope-dot confirm-box__envelope-dot--2" />
      <div class="confirm-box__envelope-dot confirm-box__envelope-dot--3" />
    </div>

    <div class="confirm-box__head">
      <h2 class="confirm-box__title">{{ t('auth.email_confirmation.title') }}</h2>
      <p class="confirm-box__sub">{{ t('auth.email_confirmation.subtitle') }}</p>
    </div>

    <div class="confirm-box__steps">
      <div class="step">
        <div class="step__num">1</div>
        <span>{{ t('auth.email_confirmation.step1') }} <strong>{{ t('app.name') }}</strong></span>
      </div>
      <div class="step">
        <div class="step__num">2</div>
        <span>{{ t('auth.email_confirmation.step2') }} <strong>{{ t('auth.email_confirmation.step2_bold') }}</strong></span>
      </div>
      <div class="step">
        <div class="step__num">3</div>
        <span>{{ t('auth.email_confirmation.step3') }}</span>
      </div>
    </div>

    <div class="confirm-box__resend">
      <span>{{ t('auth.email_confirmation.not_received') }}</span>
      <Transition name="fade-swap" mode="out-in">
        <span v-if="resent" class="confirm-box__resent-msg">
          <i class="pi pi-check-circle" /> {{ t('auth.email_confirmation.resent') }}
        </span>
        <button v-else class="confirm-box__resend-btn" @click="resendEmail">
          {{ t('auth.email_confirmation.resend') }}
        </button>
      </Transition>
    </div>

    <router-link to="/auth/login" class="confirm-box__back">
      <i class="pi pi-arrow-left" />
      {{ t('auth.email_confirmation.back') }}
    </router-link>
  </div>
</template>

<style scoped>
.confirm-box { width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.confirm-box__envelope { position: relative; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; }
.confirm-box__envelope-icon {
  width: 70px; height: 70px; border-radius: 18px;
  background: linear-gradient(135deg, var(--p-primary-50), var(--p-primary-100));
  color: var(--p-primary-600); display: flex; align-items: center; justify-content: center; font-size: 1.75rem;
  border: 1px solid color-mix(in srgb, var(--p-primary-200) 60%, transparent);
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.confirm-box__envelope-dot { position: absolute; border-radius: 50%; background: var(--p-primary-400); animation: ping 2s ease-in-out infinite; }
.confirm-box__envelope-dot--1 { width: 8px; height: 8px; top: 2px; right: 2px; }
.confirm-box__envelope-dot--2 { width: 6px; height: 6px; bottom: 4px; left: 4px; animation-delay: 0.4s; opacity: 0.6; }
.confirm-box__envelope-dot--3 { width: 5px; height: 5px; top: 10px; left: 0; animation-delay: 0.8s; opacity: 0.4; }
@keyframes ping { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.3; } }
.confirm-box__head { text-align: center; }
.confirm-box__title { font-size: 1.5rem; font-weight: 800; color: var(--p-surface-900); letter-spacing: -0.03em; margin: 0 0 0.4rem; }
.confirm-box__sub { font-size: 0.875rem; color: var(--p-surface-500); margin: 0; line-height: 1.65; }
.confirm-box__steps {
  display: flex; flex-direction: column; gap: 0.75rem; width: 100%;
  background: var(--p-surface-50); border: 1px solid var(--p-surface-200); border-radius: 12px; padding: 1rem 1.1rem;
}
.step { display: flex; align-items: center; gap: 0.85rem; font-size: 0.855rem; color: var(--p-surface-600); }
.step__num {
  width: 24px; height: 24px; min-width: 24px; border-radius: 50%;
  background: var(--p-primary-100); color: var(--p-primary-700);
  display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;
}
.confirm-box__resend { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--p-surface-400); }
.confirm-box__resend-btn { background: none; border: none; font-size: 0.82rem; font-weight: 600; color: var(--p-primary-600); cursor: pointer; padding: 0; font-family: inherit; }
.confirm-box__resend-btn:hover { text-decoration: underline; }
.confirm-box__resent-msg { font-size: 0.82rem; font-weight: 600; color: #10b981; display: flex; align-items: center; gap: 0.3rem; }
.confirm-box__back { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 500; color: var(--p-surface-500); text-decoration: none; transition: color 0.15s; }
.confirm-box__back:hover { color: var(--p-surface-800); }
.fade-swap-enter-active, .fade-swap-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-swap-enter-from { opacity: 0; transform: translateY(-4px); }
.fade-swap-leave-to { opacity: 0; transform: translateY(4px); }
</style>
