import { createRouter, createWebHistory } from 'vue-router'
import {navigationGuard} from "@/router/guard.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      meta: { requiresAuth: false },
      component: () => import('@/views/auth/AuthLayoutView.vue'),
      name: 'auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue')
        },
        {
          path: 'reset-password',
          name: 'resetpassword',
          component: () => import('@/views/auth/reset-password/ResetPasswordLayoutView.vue'),
          children: [
            {
              path: 'send-email',
              name: 'sendmail',
              component: () => import("@/views/auth/reset-password/ResetPasswordFormView.vue")
            },
            {
              path: 'send-email/confirmation',
              name: 'sendmailconfiramtion',
              component: () => import("@/views/auth/reset-password/SendEmailConfirmationView.vue")
            },
            {
              path: 'reinit',
              name: 'reinitpassword',
              component: () => import("@/views/auth/reset-password/ReinitPasswordView.vue")
            }
          ]
        }
      ]
    },
    {
      path: '/',
      component: () => import('@/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/views/DashboardView.vue'),
          name: 'dashboard',
          meta: { title: 'Dashboard' }
        }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/errors/NotFoundView.vue"),
      meta: { public: true },
    },
  ],
})

navigationGuard(router);

export default router
