import {type Router} from "vue-router";
import useAuthStore from "@/stores/useAuthStore.ts";

export function navigationGuard(router: Router) {

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    if (!authStore.isAuthInitialized) {
      await authStore.initAuth();
    }

    if (to.meta?.requiresAuth && !isAuthenticated) {
      next({ name: 'login' });
    } else {
      next();
    }

  })
}
