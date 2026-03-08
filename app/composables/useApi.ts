export const useApi = () => {
  const config = useRuntimeConfig()

  const options = (method = 'GET', body?: any) => ({
    method,
    baseURL: config.public.apiUrl as string,
    credentials: 'include' as RequestCredentials,
    ...(body && { body }),
    onResponseError({ response }: { response: any }) {
      if (response.status === 401) {
        navigateTo('/auth/login')
      }
    }
  })

  const get  = <T>(url: string) => $fetch<T>(url, options())
  const post = <T>(url: string, body: any) => $fetch<T>(url, options('POST', body))
  const put  = <T>(url: string, body: any) => $fetch<T>(url, options('PUT', body))
  const del  = <T>(url: string) => $fetch<T>(url, options('DELETE'))

  // Versions raw — accès au status code
  const getRaw  = <T>(url: string) => $fetch.raw<T>(url, options())
  const postRaw = <T>(url: string, body: any) => $fetch.raw<T>(url, options('POST', body))

  return { get, post, put, del, getRaw, postRaw }
}
