<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast, Button, Password, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { computed } from "vue"
import { useI18n } from 'vue-i18n'
import useAuthStore, { type ReinitPasswordPayload } from "@/stores/useAuthStore.ts"

const router = useRouter()
const toast  = useToast()
const auth   = useAuthStore()
const { t }  = useI18n()

const token = computed(() => (router.currentRoute.value.query.token as string) || "")

const resolver = zodResolver(
  z.object({
    password: z.string()
      .min(8,        { message: t('auth.validation.password_min') })
      .regex(/[A-Z]/, { message: t('auth.validation.password_uppercase') })
      .regex(/[0-9]/, { message: t('auth.validation.password_number') }),
    confirmPassword: z.string().min(1, { message: t('auth.validation.confirm_required') }),
  }).refine(d => d.password === d.confirmPassword, {
    message: t('auth.validation.passwords_mismatch'),
    path: ['confirmPassword'],
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    const payload: ReinitPasswordPayload = {
      token: token.value,
      ...values
    }

    auth.reinitPassword(payload)
      .then(() => {
        toast.add({ severity: 'success', summary: t('toast.password_reset_summary'), detail: t('toast.password_reset_detail'), life: 3000 })
        router.push({ name: 'login' })
      })
      .catch((error: any) => {
        toast.add({ severity: 'error', summary: t('auth.reinit_password.reset_password_error_summary'), detail: error.message, life: 4000 })

        setTimeout(() => {
          router.push({ name: 'login' })
        }, 4000)
      })
  }
}

const passwordRequirements = computed(() => [
  { label: t('auth.reinit_password.requirements.min_chars'), regex: /.{8,}/ },
  { label: t('auth.reinit_password.requirements.uppercase'), regex: /[A-Z]/ },
  { label: t('auth.reinit_password.requirements.number'),    regex: /[0-9]/ },
])
</script>

<template>
  <div class="reinit-box">

    <div class="reinit-box__icon-wrap">
      <div class="reinit-box__icon">
        <i class="pi pi-shield"></i>
      </div>
    </div>

    <div class="reinit-box__head">
      <h2 class="reinit-box__title">{{ t('auth.reinit_password.title') }}</h2>
      <p class="reinit-box__sub">{{ t('auth.reinit_password.subtitle') }}</p>
    </div>

    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="reinit-box__form">

      <div class="field">
        <label class="field__label">{{ t('auth.reinit_password.new_label') }}</label>
        <Password
          name="password"
          :placeholder="t('auth.reinit_password.new_placeholder')"
          toggleMask
          fluid
          :invalid="$form.password?.invalid"
        >
          <template #footer>
            <div class="pwd-hints">
              <div
                v-for="req in passwordRequirements"
                :key="req.label"
                class="pwd-hint"
                :class="{ 'pwd-hint--ok': req.regex.test($form.password?.value || '') }"
              >
                <i :class="`pi ${req.regex.test($form.password?.value || '') ? 'pi-check-circle' : 'pi-circle'}`" />
                {{ req.label }}
              </div>
            </div>
          </template>
        </Password>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password.error?.message }}
        </Message>
      </div>

      <div class="field">
        <label class="field__label">{{ t('auth.reinit_password.confirm_label') }}</label>
        <Password
          name="confirmPassword"
          :placeholder="t('auth.reinit_password.confirm_placeholder')"
          :feedback="false"
          toggleMask
          fluid
          :invalid="$form.confirmPassword?.invalid"
        />
        <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">
          {{ $form.confirmPassword.error?.message }}
        </Message>
      </div>

      <Button type="submit" :label="t('auth.reinit_password.submit')" fluid icon="pi pi-check" />
    </Form>

    <router-link to="/auth/login" class="reinit-box__back">
      <i class="pi pi-arrow-left" />
      {{ t('auth.reinit_password.back') }}
    </router-link>

  </div>
</template>

<style scoped>
.reinit-box {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.35rem;
}

.reinit-box__icon-wrap { display: flex; justify-content: center; }

.reinit-box__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--p-primary-50);
  color: var(--p-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--p-primary-200) 60%, transparent);
}

.reinit-box__head { text-align: center; }

.reinit-box__title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--p-surface-900);
  letter-spacing: -0.03em;
  margin: 0 0 0.4rem;
}

.reinit-box__sub {
  font-size: 0.875rem;
  color: var(--p-surface-500);
  margin: 0;
  line-height: 1.6;
}

.reinit-box__form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-surface-700);
}

/* Password hints inside PrimeVue Password footer slot */
.pwd-hints {
  padding: 0.5rem 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pwd-hint {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--p-surface-400);
  transition: color 0.2s;
}

.pwd-hint--ok {
  color: #10b981;
}

.pwd-hint .pi {
  font-size: 0.7rem;
}

/* Back */
.reinit-box__back {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--p-surface-500);
  text-decoration: none;
  transition: color 0.15s;
}
.reinit-box__back:hover { color: var(--p-surface-800); }
.reinit-box__back .pi { font-size: 0.75rem; }
</style>
