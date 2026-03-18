import {defineStore} from "pinia";
import type {Event, GlobalStats} from "~/types/model";
import {useApi} from "~/composables/useApi";
import {useAuthStore} from "~/stores/authStore";

interface getEventsResponse {
  items: Event[],
  hasNextPage: boolean,
  nextCursor: number | null,
  status: string
}

interface CreateEventResponse{
  event: Event
  status: 'success' | 'error'
}

interface GetGlobalStatsResponse {
  stats: GlobalStats,
  status: "success" | "error"
}

interface FilterParam {
  term?: string
  status?: string
}

interface EventResponse {
  event: Event,
  status: 'success' | 'error'
}

export const useEventStore = defineStore('event', () => {

  const { get, post, put, del, patch } = useApi()

  const auth = useAuthStore()

  const getEvents = async (cursor: number, limit?: number, filterParam?: FilterParam): Promise<getEventsResponse> => {
    let url = `/public/organizers/${auth.user?.id}/events?cursor=${cursor}&limit=${limit || 10}`
    if(filterParam?.term !== null && filterParam?.term !== undefined && filterParam?.term !== '') {
        url += `&term=${filterParam?.term}`
    }

    if(filterParam?.status !== null && filterParam?.status !== undefined && filterParam?.status !== '') {
      url += `&status=${filterParam?.status}`
    }
    return await get<getEventsResponse>(url);
  }

  const createEvent = async (form: FormData): Promise<EventResponse> => {
    return await post<EventResponse>(`/organizer/events`, form);
  }

  const updateEvent = async (id: number, form: FormData): Promise<EventResponse> => {
    return await put<EventResponse>(`/organizer/events/${id}`, form)
  }

  const deleteEvent = async (id: number) => {
    return await del(`/organizer/events/${id}`)
  }

  const getEvent = async (id: number): Promise<Event> => {
    const response = await get<EventResponse>(`/public/organizer/${auth.user?.id}/events/${id}`)

    if(response.status === 'error') {
      throw new Error('Failed to fetch event')
    }

    return response.event;
  }

  const updateStatus = async (id: number, status: string) => {
    return await patch(`/organizer/events/${id}/status`, {status})
  }

  const getGlobalStats = async (): Promise<GlobalStats> => {
    const response = await get<GetGlobalStatsResponse>(`/organizer/events/stats`)
    return response.stats;
  }

  return {
    getEvents,
    createEvent,
    deleteEvent,
    updateEvent,
    getEvent,
    updateStatus,
    getGlobalStats
  }
});
