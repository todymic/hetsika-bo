import type {AxiosInstance} from "axios";
import useAuthStore from "@/stores/useAuthStore.ts";

const useInterceptor = (axiosInstance: AxiosInstance) => {

  const auth = useAuthStore();
  // interceptors to handle 401 and 403 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        await auth.frontLogout();
      }
      return Promise.reject(error);
    }
  );
}
