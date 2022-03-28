import { Injectable } from '@angular/core';
import { ICommunityEvent, ICommunityEventListResponse, ICommunityEventResponse } from '../types/community-event.types';

@Injectable({
  providedIn: 'root'
})
export class CommunityEventService {

  constructor() { }

  private root: string = "http://localhost:8000";

  createEvent(eventDetails: ICommunityEvent): ICommunityEventResponse {
    return {
      code: 0,
      message: "success"
    }
  }

  getEvents(): ICommunityEventListResponse {
    return {
      events: [],
      code: 0,
      message: "success"
    }
  }

  updateEvent(eventId: string, updatedEventDetails: ICommunityEvent): ICommunityEventResponse {
    return {
      code: 0,
      message: "success"
    }
  }

  deleteEvent(eventId: string): ICommunityEventResponse {
    return {
      code: 0,
      message: "success"
    }
  }
}
