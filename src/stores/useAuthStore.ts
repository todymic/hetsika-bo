import {defineStore} from "pinia";
import {computed, type Ref, ref} from "vue";
import axios from "axios";
import {AUTH_USER} from "@/constants/type.ts";
import router from "@/router";

export type LoginCredentials = {
  email: string;
  password: string;
}

export type RegisterCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

type role = 'ROLE_ORGANIZER' | 'ROLE_USER';

export type Organizer = {
    id: number;
   firstName: string;
   lastName: string;
   email: string;
   password: string;
   roles: role[];
}

type MeResponse = {
  me: Organizer;
  status: string;
}


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});



const useAuthStore = defineStore('authStore', () => {

  const user: Ref<Organizer | null> = ref<Organizer | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null
  );

  const isAuthInitialized: Ref<boolean> = ref(false);
  const isAuthenticated = computed(() => !!user.value);

  const initAuth = async () => {
    try {
      await getMe();
    } catch (e: any) {
      logout();
    } finally {
      isAuthInitialized.value = true;
    }
  };





  const login = async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post('/organizer/login', credentials)
    if(response.status === 204) {
      await getMe();
      await router.push({name: 'dashboard'})
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    const response = await axiosInstance.post('/organizer/register', credentials)
    if(response.status === 204) {
      await getMe();
      await router.push({name: 'dashboard'})
    }

  }

  const getMe = async () => {
    const response = await axiosInstance.get('/organizer/profile/me');

    if(response.status == 200) {
      const me = response.data as MeResponse;
      user.value = me.me;
      localStorage.setItem(AUTH_USER, JSON.stringify(user.value));
    }

  }

  const logout = async () => {
    const response = await axiosInstance.get('/organizer/logout');
    if(response.status === 204) {
      await frontLogout();
    }

  }
  async function frontLogout() {
    localStorage.removeItem(AUTH_USER);
    user.value = null;
    await router.push({name: 'login'})
  }


  return {
    login,
    register,
    getMe,
    user,
    isAuthenticated,
    isAuthInitialized,
    initAuth,
    frontLogout
  }
});

export default useAuthStore;
