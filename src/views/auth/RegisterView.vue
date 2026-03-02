<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast, Button, InputText, Password, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import useAuthStore from "@/stores/useAuthStore.ts";

const { t } = useI18n()
const router = useRouter()
const toast  = useToast()
const auth   = useAuthStore()

const resolver = zodResolver(
  z.object({
    firstName:            z.string().min(2,  { message: t('auth.validation.name_min') }),
    lastName:            z.string().min(2,  { message: t('auth.validation.name_min') }),
    email:           z.email(  { message: t('auth.validation.email_invalid') }),
    password:        z.string().min(8,  { message: t('auth.validation.password_min') }),
    confirmPassword: z.string().min(1,  { message: t('auth.validation.confirm_required') }),
  }).refine(d => d.password === d.confirmPassword, {
    message: t('auth.validation.passwords_mismatch'),
    path: ['confirmPassword'],
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    auth.register(values)
      .then(() => {
        toast.add({ severity: 'success', summary: t('toast.register_success_summary'), detail: t('toast.register_success_detail'), life: 3000 })
        router.push('/')
    })
      .catch((error: any) => {
        toast.add({ severity: 'error', summary: t('toast.register_error_summary'), detail: error.message, life: 4000 })
      })

  }
}
</script>

<template>
  <div class="register-box">
    <div class="register-box__head">
      <h2 class="register-box__title">{{ t('auth.register.title') }}</h2>
      <p class="register-box__sub">{{ t('auth.register.subtitle') }}</p>
    </div>

    <button class="social-btn">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {{ t('auth.register.google') }}
    </button>

    <div class="divider"><span>{{ t('auth.register.divider') }}</span></div>

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="register-box__form">
      <div class="field-row">
        <div class="field">
          <label class="field__label">{{ t('auth.register.first_name') }}</label>
          <InputText name="firstName" :placeholder="t('auth.register.first_name')" fluid :invalid="$form.firstName?.invalid" />
          <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{ $form.firstName.error?.message }}</Message>
        </div>

        <div class="field">
          <label class="field__label">{{ t('auth.register.last_name') }}</label>
          <InputText name="lastName" :placeholder="t('auth.register.last_name')" fluid :invalid="$form.lastName?.invalid" />
          <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{ $form.lastName.error?.message }}</Message>
        </div>
      </div>


      <div class="field">
        <label class="field__label">{{ t('auth.register.email_label') }}</label>
        <InputText name="email" type="email" :placeholder="t('auth.register.email_placeholder')" fluid :invalid="$form.email?.invalid" />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
      </div>

      <div class="field-row">
        <div class="field">
          <label class="field__label">{{ t('auth.register.password_label') }}</label>
          <Password name="password" :placeholder="t('auth.register.password_placeholder')" toggleMask fluid :invalid="$form.password?.invalid" />
          <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
        </div>
        <div class="field">
          <label class="field__label">{{ t('auth.register.confirm_label') }}</label>
          <Password name="confirmPassword" :placeholder="t('auth.register.confirm_placeholder')" :feedback="false" toggleMask fluid :invalid="$form.confirmPassword?.invalid" />
          <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">{{ $form.confirmPassword.error?.message }}</Message>
        </div>
      </div>

      <p class="register-box__terms">
        {{ t('auth.register.terms') }}
        <a href="#">{{ t('auth.register.terms_link') }}</a>
        {{ t('auth.register.and') }}
        <a href="#">{{ t('auth.register.privacy_link') }}</a>.
      </p>

      <Button type="submit" :label="t('auth.register.submit')" fluid icon="pi pi-user-plus" />
    </Form>

    <p class="register-box__footer">
      {{ t('auth.register.has_account') }}
      <router-link to="/auth/login" class="register-box__link">{{ t('auth.register.signin') }}</router-link>
    </p>
  </div>
</template>

<style scoped>
.register-box { width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 1.2rem; }
.register-box__head { text-align: center; }
.register-box__title { font-size: 1.6rem; font-weight: 800; color: var(--p-surface-900); letter-spacing: -0.03em; margin: 0 0 0.3rem; }
.register-box__sub { font-size: 0.875rem; color: var(--p-surface-500); margin: 0; }
.social-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.65rem;
  width: 100%; padding: 0.65rem 1rem; border: 1px solid var(--p-surface-300); border-radius: 8px;
  background: var(--p-surface-0); color: var(--p-surface-700); font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: background 0.15s, border-color 0.15s; font-family: inherit;
}
.social-btn:hover { background: var(--p-surface-50); border-color: var(--p-surface-400); }
.divider { display: flex; align-items: center; gap: 0.75rem; color: var(--p-surface-400); font-size: 0.78rem; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--p-surface-200); }
.register-box__form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
.field__label { font-size: 0.82rem; font-weight: 600; color: var(--p-surface-700); }
.field-row { display: flex; flex-direction: column; gap: 1rem; }
@media (min-width: 500px) { .field-row { flex-direction: row; } }
.register-box__terms { font-size: 0.78rem; color: var(--p-surface-400); margin: 0; line-height: 1.5; }
.register-box__terms a { color: var(--p-primary-600); text-decoration: none; }
.register-box__terms a:hover { text-decoration: underline; }
.register-box__footer { text-align: center; font-size: 0.82rem; color: var(--p-surface-500); margin: 0; }
.register-box__link { color: var(--p-primary-600); font-weight: 600; text-decoration: none; }
.register-box__link:hover { text-decoration: underline; }
</style>
