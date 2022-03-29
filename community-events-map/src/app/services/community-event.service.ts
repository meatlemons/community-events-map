import { Injectable } from '@angular/core';
import { ICommunityEvent, ICommunityEventCreateRequest, ICommunityEventListResponse, IGenericRESTResponse } from '../types/community-event.types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class CommunityEventService {

  constructor(private http: HttpClient) { }

  private root: string = "http://localhost:3000/api";

  createEvent(eventDetails: ICommunityEventCreateRequest): Observable<IGenericRESTResponse> {
    const endpoint = "/event";

    return this.http.post<IGenericRESTResponse>(this.root + endpoint, eventDetails);
  }

  getEvents(): Observable<ICommunityEvent[]> {
    const endpoint = "/events";

    this.http.get<ICommunityEventListResponse>(this.root + endpoint).pipe(
      map(response => response.result)
    ).subscribe(res => console.log("res: ", res));

    return this.http.get<ICommunityEventListResponse>(this.root + endpoint).pipe(
      map(response => response.result.filter(event => 
          Math.floor(new Date(event.ExpiryDateTime).getTime() / 1000) < Date.now())
            .map(event => {
              return {
                Id: event.EventID,
                title: event.EventTitle,
                startDateTime: event.StartDateTime,
                expiryDateTime: event.ExpiryDateTime,
                description: event.Description,
                contactEmail: event.ContactEmail,
                contactTelephone: event.ContactTelephone,
                geolocation: event.GeoLocation,
                tags: JSON.parse(event.Tags)
              }
            }
      ))
    );
  }

  updateEvent(eventId: string, updatedEventDetails: ICommunityEvent): Observable<IGenericRESTResponse> {
    const endpoint = `event/update/${eventId}`;

    return this.http.post<IGenericRESTResponse>(this.root + endpoint, updatedEventDetails);
  }

  deleteEvent(eventId: string): Observable<IGenericRESTResponse> {
    const endpoint = `/event/${eventId}`;

    return this.http.delete<IGenericRESTResponse>(this.root + endpoint);
  }
}
