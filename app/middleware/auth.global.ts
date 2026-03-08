import {useAuthStore} from "~/stores/authStore";

export default defineNuxtRouteMiddleware((to, from) => {

  const auth = useAuthStore();

  if(to.path.startsWith('/auth')) return


  if(!auth.isLoggedIn)
    return navigateTo('/auth/login')
})
