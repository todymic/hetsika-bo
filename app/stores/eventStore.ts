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

interface CreateEventRequest {
  title: string
  description: string
  startAt: string
  endAt: string | null
}

interface getGlobalStatsResponse {
  stats: GlobalStats,
  status: "success" | "error"
}

interface FilterParam {
  term?: string
  status?: string
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

  const createEvent = async (event: CreateEventRequest) => {
    const response = await post(`/public/organizer/events`, event)
    return response as Event;
  }

  const updateEvent = async (event: Event) => {}

  const deleteEvent = async (id: number) => {
    return await del(`/organizer/events/${id}`)
  }

  const getEvent = async (id: number) => {
    return await get(`/public/organizer/${auth.user?.id}/events/${id}`)
  }

  const updateStatus = async (id: number, status: string) => {
    return await patch(`/organizer/events/${id}/status`, {status})
  }

  const getGlobalStats = async (): Promise<GlobalStats> => {
    const response = await get<getGlobalStatsResponse>(`/organizer/events/stats`)
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
