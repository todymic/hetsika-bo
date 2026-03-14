
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'

export  interface Event {
  id?: number|undefined,
  title?: string,
  description: string,
  startAt: Date,
  endAt?: Date | null,
  status: EventStatus,
  address?: Address,
  organizer: Organizer,
  categories: Category[],
  medias?: Media[],
  createdAt?: Date
}

export interface Address {
  street: string,
  city: string,
  state: string,
  zip: string,
  placeId?: number | null
}

export interface Organizer {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  status: 'ACTIVE' | 'INACTIVE'
}

export interface Category {
  id: number,
  name: string,
  slug: string
}

export interface Media {
  id: number,
  url: string,
  mimeType: string,
  originalName: string,
  width: number,
  height: number,
  createdAt: Date,
  isCover?: boolean,
  caption?: string
}
