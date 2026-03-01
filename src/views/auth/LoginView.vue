<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast, Button, InputText, Password, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import useAuthStore from '@/stores/useAuthStore'

const router = useRouter()
const toast = useToast()

const resolver = zodResolver(
  z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(1, { message: 'Password is required' }),
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    const auth = useAuthStore()
    auth
      .login(values)
      .then(() => {
        toast.add({ severity: 'success', summary: 'Welcome back!', detail: 'Login successful', life: 3000 })
        router.push('/')
      })
      .catch((error: any) => {
        toast.add({ severity: 'error', summary: 'Login failed', detail: error.message, life: 4000 })
      })
  }
}
</script>

<template>
  <div class="login-card">
    <!-- Header -->
    <div class="login-card__header">
      <div class="login-card__icon">
        <i class="pi pi-lock"></i>
      </div>
      <h2 class="login-card__title">Welcome back</h2>
      <p class="login-card__subtitle">Sign in to your account to continue</p>
    </div>

    <!-- Form -->
    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="login-card__form">
      <div class="field">
        <label for="email" class="field__label">Email address</label>
        <InputText
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          fluid
          :class="{ 'p-invalid': $form.email?.invalid }"
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple" class="field__error">
          {{ $form.email.error?.message }}
        </Message>
      </div>

      <div class="field">
        <div class="field__label-row">
          <label for="password" class="field__label">Password</label>
          <a href="#" class="field__forgot">Forgot password?</a>
        </div>
        <Password
          id="password"
          name="password"
          placeholder="••••••••"
          :feedback="false"
          toggleMask
          fluid
          :class="{ 'p-invalid': $form.password?.invalid }"
        />
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="field__error">
          {{ $form.password.error?.message }}
        </Message>
      </div>

      <Button type="submit" label="Sign in" fluid class="login-card__submit">
        <template #icon>
          <i class="pi pi-sign-in"></i>
        </template>
      </Button>
    </Form>

    <!-- Footer -->
    <div class="login-card__footer">
      <span>Don't have an account?</span>
      <router-link to="/register" class="login-card__link">Create one</router-link>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--p-surface-0);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--p-surface-200);
}

/* Header */
.login-card__header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--p-primary-50);
  color: var(--p-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.4rem;
}

.login-card__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--p-surface-900);
  margin: 0 0 0.35rem;
}

.login-card__subtitle {
  font-size: 0.9rem;
  color: var(--p-surface-500);
  margin: 0;
}

/* Fields */
.login-card__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-surface-700);
}

.field__label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field__forgot {
  font-size: 0.8rem;
  color: var(--p-primary-600);
  text-decoration: none;
  transition: color 0.2s;
}
.field__forgot:hover {
  color: var(--p-primary-700);
  text-decoration: underline;
}

.field__error {
  margin-top: 0.15rem;
}

/* Submit */
.login-card__submit {
  margin-top: 0.5rem;
}

/* Footer */
.login-card__footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.login-card__link {
  color: var(--p-primary-600);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.login-card__link:hover {
  color: var(--p-primary-700);
  text-decoration: underline;
}
</style>
