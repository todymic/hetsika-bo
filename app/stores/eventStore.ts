import {defineStore} from "pinia";
import type {Address, Event, EventSalesStats, GlobalStats, Order} from "~/types/model";
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

  const updateEventAddress = async (id: number, address: Address): Promise<EventResponse> => {
    return await patch<EventResponse>(`/organizer/events/${id}/address`, {address})
  }

  const deleteEvent = async (id: number) => {
    return await del(`/organizer/events/${id}`)
  }

  const getEvent = async (id: number): Promise<Event> => {
    const response = await get<EventResponse>(`/public/organizers/${auth.user?.id}/events/${id}`)
    if(response.status === 'error') {
      throw new Error('Failed to fetch event')
    }

    return response.event;
  }

  const updateStatus = async (id: number, status: string): Promise<EventResponse> => {
    return await patch<EventResponse>(`/organizer/events/${id}/status`, {status})
  }

  const getGlobalStats = async (): Promise<GlobalStats> => {
    const response = await get<GetGlobalStatsResponse>(`/organizer/events/stats`)
    return response.stats;
  }

  const getEventStats = async (id: number): Promise<EventSalesStats> =>
    await get(`/api/events/${id}/stats`)

  const getEventOrders = async (id: number): Promise<Order[]> =>
    await get(`/api/events/${id}/orders`)

  const finalizeOrder = async (orderId: number): Promise<void> =>
    await post(`/api/orders/${orderId}/finalize`,{})

  const publishEvent = async (id: number, isPublish: boolean): Promise<boolean> => {
    const response =  await updateStatus(id, isPublish ? 'published' : 'draft')
    return response.status === 'success';
  }

  return {
    getEvents,
    createEvent,
    deleteEvent,
    updateEvent,
    getEvent,
    updateStatus,
    getGlobalStats,
    finalizeOrder,
    getEventOrders,
    getEventStats,
    publishEvent,

  }
});
