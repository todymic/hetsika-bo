import {defineStore} from "pinia";
import {ref} from "vue";
import type {Organizer} from "@/stores/authStore.ts";
import axios from "axios";

type Status = 'PUBLISHED' | 'DRAFT' | 'CANCELLED' ;

export interface Address {
  placeId?: string;
  street: string;
  city: string;
  zipcode: string;
  countryCode: string;
}

export interface Category {
  id?: number;
  name: string;
}

export interface Media {
  id?: number;
  url: string;
  mimeType: string;
  originalName: string;
  width?: number;
  height?: number;
  isCover?: boolean;
  position?: number;
  caption?: string;
  sizeBytes?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  endAt?: Date;
  createdAt: Date;
  status: Status;
  address: Address;
  organizer?: Organizer;
  categories: Category[];
  medias: Media[];
}

export interface EventsResponse {
  events: Event[];
  status: string;
}

export interface EventResponse {
  event: Event;
  status: string;
}

const eventStore = defineStore('eventStore', () => {

  const events = ref<Event[] | null>(null);
  const organizer: Organizer = JSON.parse(localStorage.getItem('user') as string) as Organizer;
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  })

  const getOneEvent = async (id: number): Promise<Event | null> => {
    const response = await axiosInstance.get(`/public/organizers/${organizer.id}/events/${id}`);
    if(response) {
      const eventResponse = response.data as EventResponse;
      return eventResponse.event;
    }

    return null
  }

  const getEvents = async (): Promise<Event[]> => {
    const response = await axiosInstance.get(`/public/organizers/${organizer.id}/events`);
    if(response) {
      const eventResponse = response.data as EventsResponse;
      events.value = eventResponse.events;
      return eventResponse.events;
    }

    return [];
  }

  return {
   getOneEvent,
      getEvents,
    events
  }
})

export default eventStore;
