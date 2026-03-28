export function useGooglePlaces() {
  const suggestions = ref<any[]>([])
  const isLoading   = ref(false)

  let autocompleteService: any = null
  let placesService:       any = null

  function init() {
    if (typeof window === 'undefined' || !window.google?.maps?.places) return
    autocompleteService = new window.google.maps.places.AutocompleteService()
    const el = document.createElement('div')
    placesService = new window.google.maps.places.PlacesService(el)
  }

  async function search(query: string) {
    if (!autocompleteService || query.length < 3) { suggestions.value = []; return }
    isLoading.value = true
    try {
      const res = await new Promise<any[]>((resolve, reject) => {
        autocompleteService.getPlacePredictions(
          { input: query },
          (r: any, s: any) => {
            if (s === 'OK' && r) resolve(r)
            else reject(s)
          }
        )
      })
      suggestions.value = res
    } catch {
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function getDetails(placeId: string): Promise<{
    street: string;
    city: string;
    zipCode: string
    country: string;
    countryCode: string;
    lat: number;
    lng: number,
    placeId: string;
    placeName: string;
  }> {
    return new Promise((resolve, reject) => {
      placesService.getDetails(
        { placeId, fields: ['name', 'address_components', 'geometry'] },
        (r: any, s: any) => {
          if (s !== 'OK' || !r) { reject(s); return }
          const get = (type: string) =>
            r.address_components?.find((c: any) => c.types.includes(type))
          resolve({
            placeId:     r.place_id,
            street:      `${get('street_number')?.long_name ?? ''} ${get('route')?.long_name ?? ''}`.trim(),
            city:        get('locality')?.long_name ?? get('postal_town')?.long_name ?? '',
            zipCode:     get('postal_code')?.long_name ?? '',
            country:     get('country')?.long_name ?? '',
            countryCode: get('country')?.short_name ?? '',
            lat:         r.geometry?.location?.lat() ?? 0,
            lng:         r.geometry?.location?.lng() ?? 0,
            placeName:        r.name ?? '',
          })
        }
      )
    })
  }

  onMounted(init)

  return { suggestions, isLoading, search, getDetails }
}
