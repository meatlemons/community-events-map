import { Injectable } from '@angular/core';
import { ICommunityEvent, ICommunityEventListResponse, ICommunityEventResponse } from '../types/community-event.types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class CommunityEventService {

  constructor(private http: HttpClient) { }

  private root: string = "http://localhost:3000/api";

  createEvent(eventDetails: ICommunityEvent): Observable<ICommunityEventResponse> {
    const endpoint = "/event";

    return this.http.post<ICommunityEventResponse>(this.root + endpoint, eventDetails);
  }

  getEvents(): Observable<ICommunityEvent[]> {
    const endpoint = "/events";
    let result: ICommunityEvent[];

    this.http.get<ICommunityEventListResponse>(this.root + endpoint).pipe(
      map(response => response.result)
    ).subscribe(res => console.log("res: ", res));

    return this.http.get<ICommunityEventListResponse>(this.root + endpoint).pipe(
      map((response: ICommunityEventListResponse) => response.result)
    );
  }

  updateEvent(eventId: string, updatedEventDetails: ICommunityEvent): Observable<ICommunityEventResponse> {
    const endpoint = `event/update/${eventId}`;

    return this.http.post<ICommunityEventResponse>(this.root + endpoint, updatedEventDetails);
  }

  deleteEvent(eventId: string): Observable<ICommunityEventResponse> {
    const endpoint = `/event/${eventId}`;

    return this.http.delete<ICommunityEventResponse>(this.root + endpoint);
  }
}
