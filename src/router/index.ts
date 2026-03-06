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
          meta: { title: 'Login' }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
          meta: { title: 'Register' }

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
        },
        {
          path: 'verify-email',
          name: 'verifyemail',
          component: () => import("@/views/auth/reset-password/EmailVerifiedConfirmation.vue"),
          meta: { title: 'Verify Email' }
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
        },
        {
          path: 'events',
          name: 'events',
          meta: { title: 'Events' },
          children: [
            {
              path: 'list',
              component: () => import('@/views/events/EventListView.vue'),
              name: 'eventslist',
              meta: { title: 'Events List' }
            },
            {
              path: 'new',
              component: () => import('@/views/events/step/EventStepView.vue'),
              name: 'createevent',
              meta: { title: 'New Event' }
            },
            {
              path: ':id/edit',
              component: () => import('@/views/events/step/EventStepView.vue'),
              name: 'editevent',
              meta: { title: 'New Event' }
            },
            {
              path: ':id/show',
              component: () => import('@/views/events/show/EventView.vue'),
              name: 'showevent',
              meta: { title: 'Show Event' }
            }
          ]
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
