import { defineStore } from 'pinia'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'

interface UploadedFile {
  id:      string
  file:    File
  preview: string | null
  error:   string | null
}

export const useEventFormStore = defineStore('eventForm', () => {

  // ── Info step ────────────────────────────────────────────
  const info = ref({
    title:              '',
    description:        '',
    selectedCategories: [] as number[],
    files:              [] as File[],
    uploadedFiles:      [] as UploadedFile[],
  })

  // ── Localisation step ─────────────────────────────────────
  const address = ref({
    street:          '',
    complement:      '',
    city:            '',
    zipCode:         '',
    selectedCountry: '',
  })

  // ── Date step ─────────────────────────────────────────────
  const dates = ref({
    startDate: undefined as DateValue | undefined,
    startTime: '',
    endDate:   undefined as DateValue | undefined,
    endTime:   '',
    hasEndDate: false,
  })

  // ── Serialize → payload API ────────────────────────────────
  function toISO(date: DateValue, time: string): string {
    const [h, m] = time.split(':').map(Number)
    const d = date.toDate(getLocalTimeZone())
    d.setHours(h ?? 0, m ?? 0, 0, 0)
    return d.toISOString()
  }

  function buildPayload() {
    const { startDate, startTime, endDate, endTime, hasEndDate } = dates.value

    const start = startDate as DateValue | undefined
    const end   = endDate   as DateValue | undefined

    return {
      title:       info.value.title,
      description: info.value.description,
      categoryIds: info.value.selectedCategories.map(Number),
      startAt:     start && startTime ? toISO(start, startTime) : '',
      endAt:       hasEndDate && end && endTime ? toISO(end, endTime) : undefined,
      address: {
        placeId:     '',
        source:      'manual' as const,
        street:      address.value.street,
        city:        address.value.city,
        zipcode:     address.value.zipCode,
        countryCode: address.value.selectedCountry,
      },
    }
  }

  function reset() {
    info.value.uploadedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
    info.value    = { title: '', description: '', selectedCategories: [], files: [], uploadedFiles: [] }
    address.value = { street: '', complement: '', city: '', zipCode: '', selectedCountry: '' }
    dates.value   = { startDate: undefined, startTime: '', endDate: undefined, endTime: '', hasEndDate: false }
  }

  return { info, address, dates, buildPayload, reset }
})
