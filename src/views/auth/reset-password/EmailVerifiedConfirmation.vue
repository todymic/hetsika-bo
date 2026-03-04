<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'
import { useI18n } from 'vue-i18n'
import useAuthStore from "@/stores/useAuthStore.ts";
import {computed, onMounted, ref} from "vue";
import {useToast} from "primevue";

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const isLoading = ref(true)
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

const signedUrl = computed(() => {
  return route.query.signedUrl as string
})

onMounted(async () => {

  if (!signedUrl.value) {
    toast.add({ severity: 'error', summary: t('toast.verify_email_error_summary'), detail: t('toast.verify_email_error_detail'), life: 4000 })
    status.value = 'error'
    errorMessage.value = t('toast.verify_email_error_detail')
    isLoading.value = false
    return
  }

  await auth.verifyEmail(signedUrl.value)
    .then(() => {
      status.value = 'success'

        setTimeout(() => {
          router.push({ name: "dashboard" })
        }, 3000)
    })
    .catch((error: any) => {
      status.value = 'error'
      errorMessage.value = error.message
      toast.add({ severity: 'error', summary: t('toast.verify_email_error_summary'), detail: error.message, life: 4000 })
    })
    .finally(() => {
      isLoading.value = false
    })
})
</script>

<template>
  <div class="verify-wrapper">

    <Transition name="fade" mode="out-in">

      <!-- Loading -->
      <div v-if="status === 'loading'" key="loading" class="verify-card">
        <div class="verify-icon verify-icon--loading">
          <span class="verify-spinner" />
        </div>
        <h2 class="verify-title">{{ t('verify_email.loading_title') }}</h2>
        <p class="verify-desc">{{ t('verify_email.loading_description') }}</p>
        <div class="verify-dots">
          <span /><span /><span />
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" key="success" class="verify-card">
        <div class="verify-icon verify-icon--success">
          <i class="pi pi-check" />
        </div>
        <h2 class="verify-title">{{ t('verify_email.success_title') }}</h2>
        <p class="verify-desc">{{ t('verify_email.success_description') }}</p>
        <div class="verify-redirect">
          <i class="pi pi-clock" />
          {{ t('verify_email.redirect_notice') }}
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="status === 'error'" key="error" class="verify-card">
        <div class="verify-icon verify-icon--error">
          <i class="pi pi-times" />
        </div>
        <h2 class="verify-title">{{ t('verify_email.error_title') }}</h2>
        <p class="verify-desc">{{ errorMessage || t('verify_email.error_description') }}</p>
        <RouterLink to="/auth/login" class="verify-btn">
          <i class="pi pi-arrow-left" />
          {{ t('verify_email.go_to_login') }}
        </RouterLink>
      </div>

    </Transition>

  </div>
</template>

<style scoped>
.verify-wrapper {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Card */
.verify-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2.5rem 2rem;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* Icon */
.verify-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  position: relative;
}

.verify-icon--loading {
  background: color-mix(in srgb, var(--p-primary-500) 10%, transparent);
  border: 2px solid color-mix(in srgb, var(--p-primary-500) 25%, transparent);
}

.verify-spinner {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--p-primary-500);
  animation: spin 0.85s linear infinite;
}

.verify-icon--success {
  background: color-mix(in srgb, var(--p-green-500, #22c55e) 12%, transparent);
  border: 2px solid color-mix(in srgb, var(--p-green-500, #22c55e) 30%, transparent);
  color: var(--p-green-500, #22c55e);
  animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.verify-icon--error {
  background: color-mix(in srgb, var(--p-red-500, #ef4444) 12%, transparent);
  border: 2px solid color-mix(in srgb, var(--p-red-500, #ef4444) 30%, transparent);
  color: var(--p-red-500, #ef4444);
  animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Text */
.verify-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--p-surface-900);
  margin: 0;
  letter-spacing: -0.02em;
}

.verify-desc {
  font-size: 0.9rem;
  color: var(--p-surface-500);
  line-height: 1.65;
  margin: 0;
}

/* Loading dots */
.verify-dots {
  display: flex;
  gap: 5px;
  margin-top: 0.25rem;
}

.verify-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-primary-400);
  animation: bounce 1.1s ease-in-out infinite;
}

.verify-dots span:nth-child(2) { animation-delay: 0.15s; }
.verify-dots span:nth-child(3) { animation-delay: 0.30s; }

/* Redirect notice */
.verify-redirect {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: var(--p-surface-400);
  background: var(--p-surface-100);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  margin-top: 0.25rem;
}

.verify-redirect .pi { font-size: 0.8rem; }

/* Button */
.verify-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding: 0.6rem 1.4rem;
  background: var(--p-primary-500);
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.18s ease, transform 0.15s ease;
  box-shadow: 0 2px 10px color-mix(in srgb, var(--p-primary-500) 35%, transparent);
}

.verify-btn:hover {
  background: var(--p-primary-600);
  transform: translateY(-1px);
}

.verify-btn .pi { font-size: 0.8rem; }

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pop {
  from { transform: scale(0.65); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.55); opacity: 0.4; }
  40%            { transform: scale(1);    opacity: 1;   }
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(6px); }
.fade-leave-to   { opacity: 0; transform: translateY(-6px); }
</style>
