import {defineStore} from "pinia";
import type { Event } from "~/types/model";
import {useApi} from "~/composables/useApi";
import {useAuthStore} from "~/stores/authStore";

interface getEventsResponse {
  events: Event[]
  status: string
}

interface CreateEventRequest {
  title: string
  description: string
  startAt: string
  endAt: string | null
}
export const useEventStore = defineStore('event', () => {

  const { get, post, put, del } = useApi()

  const auth = useAuthStore()

  const getEvents = async (): Promise<Event[]> => {
    const response = await get<getEventsResponse>(`/public/organizer/${auth.user?.id}/events`)
    return response.events as Event[];
  }

  const createEvent = async (event: CreateEventRequest) => {
    const response = await post(`/public/organizer/${auth.user?.id}/events`, event)
    return response as Event;
  }

  return {
    getEvents
  }
});
