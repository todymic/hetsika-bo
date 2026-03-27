// plugins/google-maps.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const script = document.createElement('script')
  script.src   = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsKey}&libraries=places`
  script.defer = true
  document.head.appendChild(script)
})
