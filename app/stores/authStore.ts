import type { Organizer } from '~/types/model'
import {useApi} from "~/composables/useApi";

export interface UserLogin {
  email: string
  password: string
}

export interface UserResponse {
  me: Organizer
  status: 'success' | 'error'
}

export interface UserRegister {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const useAuthStore = defineStore('authStore', () => {

  const userCookie = useCookie<Organizer | null>('auth_user', {
    default: () => null,
    watch: true
  })

  const user = computed(() => userCookie.value)
  const isLoggedIn = computed(() => !!userCookie.value)

  const { postRaw, getRaw, get } = useApi()

  const initAuth = async () => {
    try {
      await getMe();
    } catch (e: any) {
      userCookie.value = null
    }
  };

  const login = async (userData: UserLogin) => {
    const response = await postRaw('/organizer/login', userData)
    if (response.status === 204) {
      return await getMe()
    }

    return Promise.reject(new Error('Invalid credentials'))
  }

  const register = async (userData: UserRegister) => {
    const response = await postRaw('/organizer/register', userData)
    if (response.status === 204) {
      await getMe()
    }
  }

  const logout = async () => {
    const response = await getRaw('/organizer/logout')
    if (response.status === 204) {
      userCookie.value = null
    }
  }

  const getMe = async () => {
    try {
      const response = await get<UserResponse>('/organizer/profile/me')
      if (response.status === 'success') {
        userCookie.value = response.me
      }
    } catch {
      userCookie.value = null
      throw new Error('Failed to fetch user data')
    }
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    getMe,
    register,
    initAuth
  }
})
