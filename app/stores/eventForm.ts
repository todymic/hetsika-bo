import { defineStore } from 'pinia'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, CalendarDate } from '@internationalized/date'
import type {Address, Event, Media} from '~/types/model'
import {dateToCalendar, dateToTime, toISO} from "~/utils/dateHelper";

export interface UploadedFile {
  id:      string
  file:    File
  preview: string | null
  error:   string | null
}

export const useEventFormStore = defineStore('eventForm', () => {

  const isEditMode = ref(false)
  const editingId  = ref<number | null>(null)

  // ── Info step ─────────────────────────────────────────────
  const info = ref({
    title:              '',
    description:        '',
    selectedCategories: [] as number[],
    files:              [] as File[],
    uploadedFiles:      [] as UploadedFile[],
    existingFiles:      [] as Media[],
    removedFileIds:     [] as number[]
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
  const dates = ref<{
    startDate:  DateValue | undefined
    startTime:  string
    endDate:    DateValue | undefined
    endTime:    string
    hasEndDate: boolean
  }>({
    startDate:  undefined,
    startTime:  '',
    endDate:    undefined,
    endTime:    '',
    hasEndDate: false,
  })



  // ── Build API payload ─────────────────────────────────────
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
      removedFileIds: info.value.removedFileIds,
    }
  }

  // ── Load event (edit mode) ────────────────────────────────
  function loadEvent(event: Event) {
    isEditMode.value = true
    editingId.value = Number(event.id)

    const eventAddress = event.address as Address

    info.value = {
      title:              event.title as string,
      description:        event.description ?? '',
      selectedCategories: event.categories.map(c => c.id),
      files:              [],
      uploadedFiles:      [],
      existingFiles:      event.medias ?? [],
      removedFileIds:     [],
    }

    address.value = {
      street:          eventAddress.street,
      complement:      '',
      city:            eventAddress.city,
      zipCode:         eventAddress.zipcode,
      selectedCountry: eventAddress.countryCode,
    }

    const hasEnd = !!event.endAt

    dates.value = {
      startDate:  dateToCalendar(event.startAt),
      startTime:  dateToTime(event.startAt),
      endDate:    hasEnd ? dateToCalendar(event.endAt!) : undefined,
      endTime:    hasEnd ? dateToTime(event.endAt!)     : '',
      hasEndDate: hasEnd,
    }


  }

  // ── Reset ─────────────────────────────────────────────────
  function reset() {

    console.log("resetting form")
    info.value.uploadedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })
    info.value    = {
      title: '',
      description: '',
      selectedCategories: [],
      files: [],
      uploadedFiles: [],
      existingFiles: [],
      removedFileIds: [],
    }
    address.value = { street: '', complement: '', city: '', zipCode: '', selectedCountry: '' }
    dates.value   = { startDate: undefined, startTime: '', endDate: undefined, endTime: '', hasEndDate: false }
  }

  function resetEditMode() {
    isEditMode.value = false
    editingId.value  = null
  }

  return {
    // State
    info,
    address,
    dates,
    isEditMode,
    editingId,
    // Actions
    loadEvent,
    buildPayload,
    reset,
    resetEditMode,
  }
})
