// types/google.d.ts
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: { input: string; types?: string[] },
              callback: (results: any[] | null, status: string) => void
            ) => void
          }
          PlacesService: new (el: HTMLElement) => {
            getDetails: (
              request: { placeId: string; fields: string[] },
              callback: (result: any | null, status: string) => void
            ) => void
          }
        }
      }
    }
  }
}

export {}
