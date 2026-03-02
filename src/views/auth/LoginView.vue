<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast, Button, InputText, Password, Message, Checkbox } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import useAuthStore from '@/stores/useAuthStore'

const { t } = useI18n()
const router  = useRouter()
const toast   = useToast()
const remember = ref(false)

const resolver = zodResolver(
  z.object({
    email:    z.string().email({ message: t('auth.validation.email_invalid') }),
    password: z.string().min(1,  { message: t('auth.validation.password_required') }),
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    const auth = useAuthStore()
    auth.login(values)
      .then(() => {
        toast.add({ severity: 'success', summary: t('toast.login_success_summary'), detail: t('toast.login_success_detail'), life: 3000 })
        router.push('/')
      })
      .catch((error: any) => {
        toast.add({ severity: 'error', summary: t('toast.login_error_summary'), detail: error.message, life: 4000 })
      })
  }
}
</script>

<template>
  <div class="login-box">
    <div class="login-box__head">
      <h2 class="login-box__title">{{ t('auth.login.title') }}</h2>
      <p class="login-box__sub">{{ t('auth.login.subtitle') }}</p>
    </div>

    <div class="login-box__social">
      <button class="social-btn">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ t('auth.login.google') }}
      </button>
    </div>

    <div class="login-box__divider"><span>{{ t('auth.login.divider') }}</span></div>

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="login-box__form">
      <div class="field">
        <label class="field__label">{{ t('auth.login.email_label') }}</label>
        <InputText name="email" type="email" :placeholder="t('auth.login.email_placeholder')" fluid :invalid="$form.email?.invalid" />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
      </div>

      <div class="field">
        <div class="field__label-row">
          <label class="field__label">{{ t('auth.login.password_label') }}</label>
          <router-link to="/auth/reset-password/send-email" class="field__link">{{ t('auth.login.forgot') }}</router-link>
        </div>
        <Password name="password" :placeholder="t('auth.login.password_placeholder')" :feedback="false" toggleMask fluid :invalid="$form.password?.invalid" />
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
      </div>

      <div class="login-box__remember">
        <Checkbox v-model="remember" inputId="remember" binary />
        <label for="remember">{{ t('auth.login.remember') }}</label>
      </div>

      <Button type="submit" :label="t('auth.login.submit')" fluid icon="pi pi-sign-in" />
    </Form>

    <p class="login-box__footer">
      {{ t('auth.login.no_account') }}
      <router-link to="/auth/register" class="login-box__link">{{ t('auth.login.create') }}</router-link>
    </p>
  </div>
</template>

<style scoped>
.login-box { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 1.25rem; }
.login-box__head { text-align: center; }
.login-box__title { font-size: 1.6rem; font-weight: 800; color: var(--p-surface-900); letter-spacing: -0.03em; margin: 0 0 0.3rem; }
.login-box__sub { font-size: 0.875rem; color: var(--p-surface-500); margin: 0; }
.login-box__social { display: flex; flex-direction: column; gap: 0.5rem; }
.social-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.65rem;
  width: 100%; padding: 0.65rem 1rem; border: 1px solid var(--p-surface-300); border-radius: 8px;
  background: var(--p-surface-0); color: var(--p-surface-700); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: background 0.15s, border-color 0.15s; font-family: inherit;
}
.social-btn:hover { background: var(--p-surface-50); border-color: var(--p-surface-400); }
.login-box__divider { display: flex; align-items: center; gap: 0.75rem; color: var(--p-surface-400); font-size: 0.78rem; }
.login-box__divider::before, .login-box__divider::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
.login-box__form { display: flex; flex-direction: column; gap: 1.1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field__label { font-size: 0.82rem; font-weight: 600; color: var(--p-surface-700); }
.field__label-row { display: flex; justify-content: space-between; align-items: center; }
.field__link { font-size: 0.78rem; color: var(--p-primary-600); text-decoration: none; font-weight: 500; }
.field__link:hover { text-decoration: underline; }
.login-box__remember { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--p-surface-600); }
.login-box__footer { text-align: center; font-size: 0.82rem; color: var(--p-surface-500); margin: 0; }
.login-box__link { color: var(--p-primary-600); font-weight: 600; text-decoration: none; }
.login-box__link:hover { text-decoration: underline; }
</style>
