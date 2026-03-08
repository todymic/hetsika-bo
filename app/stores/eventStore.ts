import {defineStore} from "pinia";
import type { Event } from "~/types/model";


interface getEventsResponse {
  events: Event[]
  status: string
}
export const useEventStore = defineStore('event', () => {

  const { get, post, put, del } = useApi()
  const getEvents = async (): Promise<Event[]> => {
    const response = await get<getEventsResponse>(`/public/organizer//events`)
    return response.events as Event[];
  }


  return {
    getEvents
  }
});
