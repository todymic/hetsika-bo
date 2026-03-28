import type {TicketType} from "~/types/model";
import {useEventFormStore} from "~/stores/eventForm";

interface TicketTypesResponse {
  ticketTypes: TicketType[],
  status: "success" | "error"
}

interface TicketTypeResponse {
  ticketType: TicketType,
  status: "success" | "error"
}

export const useTicketTypeStore = defineStore('ticketType', () => {

  const {get, post, put, del, patch} = useApi();
  const store =  useEventFormStore();
  const eventId = computed(() =>
    store.isEditMode ? store.editingId : store.savedEventId
  );

  const createTicket = async (ticketType: TicketType): Promise<TicketTypeResponse> => {
    return await post<TicketTypeResponse>(`/organizer/events/${eventId.value}/ticket-types`, ticketType)
  }

  const getList = async (): Promise<TicketType[]> => {
    const response = await get<TicketTypesResponse>(`/organizer/events/${eventId.value}/ticket-types`)
    return response.ticketTypes;
  }

  const getOne= async (id: number): Promise<TicketTypeResponse> => {
    return await get<TicketTypeResponse>(`/organizer/events/${eventId.value}/ticket-types/${id}`)
  }

  const deleteOne = async (id: number): Promise<void> => {
    return await del(`/organizer/events/${eventId.value}/ticket-types/${id}`)
  }

  const update = async (id: number, ticketType: TicketType): Promise<TicketTypeResponse> => {
    return await put<TicketTypeResponse>(`/organizer/events/${eventId.value}/ticket-types/${id}`, ticketType)
  }

  return {
    createTicket,
    getList,
    getOne,
    deleteOne,
    update
  }
})
