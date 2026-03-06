<script setup lang="ts">
import { useRouter } from 'vue-router'
import {Button, InputText, Message, useToast} from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import authStore from "@/stores/authStore.ts";

const { t } = useI18n()
const router = useRouter()
const auth = authStore()
const toast = useToast()

const resolver = zodResolver(
  z.object({
    email: z.string().email({ message: t('auth.validation.email_invalid') }),
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    auth.sendPasswordResetEmail(values.email)
      .then(() => {
        router.push('/auth/reset-password/send-email/confirmation')
      })
      .catch((error: any) => {
        toast.add({ severity: 'error', summary: t('toast.reset_password_error_summary'),
          detail: error.message,
          life: 4000 })
      })
  }
}
</script>

<template>
  <div class="reset-box">
    <div class="reset-box__icon-wrap">
      <div class="reset-box__icon"><i class="pi pi-lock"></i></div>
    </div>

    <div class="reset-box__head">
      <h2 class="reset-box__title">{{ t('auth.reset_password.title') }}</h2>
      <p class="reset-box__sub">{{ t('auth.reset_password.subtitle') }}</p>
    </div>

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="reset-box__form">
      <div class="field">
        <label class="field__label">{{ t('auth.reset_password.email_label') }}</label>
        <InputText name="email" type="email" :placeholder="t('auth.reset_password.email_placeholder')" fluid :invalid="$form.email?.invalid" />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
      </div>
      <Button type="submit" :label="t('auth.reset_password.submit')" fluid icon="pi pi-send" />
    </Form>

    <router-link to="/auth/login" class="reset-box__back">
      <i class="pi pi-arrow-left" />
      {{ t('auth.reset_password.back') }}
    </router-link>
  </div>
</template>

<style scoped>
.reset-box { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 1.35rem; align-items: center; }
.reset-box__icon-wrap { display: flex; justify-content: center; }
.reset-box__icon {
  width: 60px; height: 60px; border-radius: 16px;
  background: var(--p-primary-50); color: var(--p-primary-600);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--p-primary-200) 60%, transparent);
}
.reset-box__head { text-align: center; }
.reset-box__title { font-size: 1.5rem; font-weight: 800; color: var(--p-surface-900); letter-spacing: -0.03em; margin: 0 0 0.4rem; }
.reset-box__sub { font-size: 0.875rem; color: var(--p-surface-500); margin: 0; line-height: 1.6; }
.reset-box__form { display: flex; flex-direction: column; gap: 1.1rem; width: 100%; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field__label { font-size: 0.82rem; font-weight: 600; color: var(--p-surface-700); }
.reset-box__back { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 500; color: var(--p-surface-500); text-decoration: none; transition: color 0.15s; }
.reset-box__back:hover { color: var(--p-surface-800); }
.reset-box__back .pi { font-size: 0.75rem; }
</style>
