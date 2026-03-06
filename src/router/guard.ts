import { type Router } from "vue-router";
import authStore from "@/stores/authStore.ts";

export function navigationGuard(router: Router) {
  router.beforeEach(async (to) => {
    const auth = authStore();

    if (!auth.isAuthInitialized) {
      await auth.initAuth();
    }

    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      return { name: "login" };
    }

    return true;
  });
}
