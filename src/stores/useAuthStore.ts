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
   fullName: string;

}

type MeResponse = {
  me: Organizer;
  status: string;
}


export type ReinitPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
}

const useAuthStore = defineStore('authStore', () => {

  function safeParseUser(): Organizer | null {
    const raw = localStorage.getItem(AUTH_USER);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw) as Organizer;
  }

  const user: Ref<Organizer | null> = ref<Organizer | null>(safeParseUser());

  const isAuthInitialized: Ref<boolean> = ref(false);
  const isAuthenticated = computed(() => !!user.value);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });


  // interceptors to handle 401 and 403 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        frontLogout();
        //await router.push({name: 'login'});
      }
      return Promise.reject(error);
    }
  );

  const initAuth = async () => {
    try {
      await getMe();
    } catch (_: any) {
      frontLogout();
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
      user.value.fullName = `${user.value.firstName} ${user.value.lastName}`;
      localStorage.setItem(AUTH_USER, JSON.stringify(user.value));
    }

  }

  const logout = async () => {
    const response = await axiosInstance.get('/organizer/logout');
    if(response.status === 204) {
      frontLogout();
      await router.push({name: 'login'});
    }

  }
  function frontLogout() {
    localStorage.removeItem(AUTH_USER);
    user.value = null;

  }

  const verifyEmail = async (signedUrl: string) => {
    return await axiosInstance.get(signedUrl);
  }

  const sendPasswordResetEmail = async (email: string) => {
    return await axiosInstance.post('/organizer/reset-password/send-email', {email});
  }

  const reinitPassword = async (payload: ReinitPasswordPayload) => {
    return await axiosInstance.post('/organizer/reset-password/reinit', payload);
  }

  return {
    login,
    register,
    getMe,
    user,
    isAuthenticated,
    isAuthInitialized,
    initAuth,
    logout,
    verifyEmail,
    sendPasswordResetEmail,
    reinitPassword
  }
});

export default useAuthStore;
