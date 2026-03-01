<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast, Button, InputText, Password, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()

const resolver = zodResolver(
  z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
)

const onFormSubmit = ({ valid, values }: any) => {
  if (valid) {
    // Call your register store action here
    console.log('Register with:', values)
    toast.add({ severity: 'success', summary: 'Account created!', detail: 'You can now sign in.', life: 3000 })
    router.push('/login')
  }
}
</script>

<template>
  <div class="register-card">
    <!-- Header -->
    <div class="register-card__header">
      <div class="register-card__icon">
        <i class="pi pi-user-plus"></i>
      </div>
      <h2 class="register-card__title">Create an account</h2>
      <p class="register-card__subtitle">Join us today, it's free</p>
    </div>

    <!-- Form -->
    <Form v-slot="$form" :resolver @submit="onFormSubmit" class="register-card__form">
      <div class="field">
        <label class="field__label">Full name</label>
        <InputText
          name="name"
          type="text"
          placeholder="John Doe"
          fluid
          :class="{ 'p-invalid': $form.name?.invalid }"
        />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <div class="field">
        <label class="field__label">Email address</label>
        <InputText
          name="email"
          type="email"
          placeholder="you@example.com"
          fluid
          :class="{ 'p-invalid': $form.email?.invalid }"
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error?.message }}
        </Message>
      </div>

      <div class="field-row">
        <div class="field">
          <label class="field__label">Password</label>
          <Password
            name="password"
            placeholder="Min. 8 characters"
            toggleMask
            fluid
            :class="{ 'p-invalid': $form.password?.invalid }"
          />
          <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.password.error?.message }}
          </Message>
        </div>

        <div class="field">
          <label class="field__label">Confirm password</label>
          <Password
            name="confirmPassword"
            placeholder="Repeat password"
            :feedback="false"
            toggleMask
            fluid
            :class="{ 'p-invalid': $form.confirmPassword?.invalid }"
          />
          <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">
            {{ $form.confirmPassword.error?.message }}
          </Message>
        </div>
      </div>

      <Button type="submit" label="Create account" fluid class="register-card__submit" />
    </Form>

    <!-- Footer -->
    <div class="register-card__footer">
      <span>Already have an account?</span>
      <router-link to="/login" class="register-card__link">Sign in</router-link>
    </div>
  </div>
</template>

<style scoped>
.register-card {
  width: 100%;
  max-width: 480px;
  background: var(--p-surface-0);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--p-surface-200);
}

.register-card__header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-card__icon {
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

.register-card__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--p-surface-900);
  margin: 0 0 0.35rem;
}

.register-card__subtitle {
  font-size: 0.9rem;
  color: var(--p-surface-500);
  margin: 0;
}

.register-card__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-surface-700);
}

/* Side-by-side passwords on larger screens */
.field-row {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 480px) {
  .field-row {
    flex-direction: row;
    gap: 1rem;
  }
}

.register-card__submit {
  margin-top: 0.5rem;
}

.register-card__footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.register-card__link {
  color: var(--p-primary-600);
  font-weight: 500;
  text-decoration: none;
}
.register-card__link:hover {
  color: var(--p-primary-700);
  text-decoration: underline;
}
</style>
