import {useAuthStore} from "~/stores/authStore";

export default defineNuxtRouteMiddleware(async (to, from) => {

  const auth = useAuthStore();

  if(!auth.isLoggedIn) {
    await auth.initAuth();
  }

  if(to.path.startsWith('/auth')) return

  if(!auth.isLoggedIn)
    return navigateTo('/auth/login')
})
