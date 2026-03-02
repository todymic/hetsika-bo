import { type Router } from "vue-router";
import useAuthStore from "@/stores/useAuthStore.ts";

export function navigationGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthInitialized) {
      await authStore.initAuth();
    }

    if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
      return { name: "login" };
    }

    return true;
  });
}
