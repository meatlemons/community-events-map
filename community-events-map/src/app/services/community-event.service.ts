import { Injectable } from '@angular/core';
import { ICommunityEvent, ICommunityEventCreateRequest, ICommunityEventListResponse, IGenericRESTResponse } from '../types/community-event.types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { BST_HOURS_OFFSET } from '../constants';

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

    return this.http.get<ICommunityEventListResponse>(this.root + endpoint).pipe(
      map(response => response.result.filter(event => 
          Math.floor(new Date(event.ExpiryDateTime).getTime() / 1000) < Date.now())
            .map(event => {
              return {
                Id: event.EventID,
                title: event.EventTitle,
                startDateTime: new Date(new Date(event.StartDateTime).setHours(new Date(event.StartDateTime).getHours() + BST_HOURS_OFFSET)),
                expiryDateTime: new Date(new Date(event.ExpiryDateTime).setHours(new Date(event.ExpiryDateTime).getHours() + BST_HOURS_OFFSET)),
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

  deleteEvent(eventId: string): Observable<IGenericRESTResponse> {
    const endpoint = `/event?eventId=${eventId}`;

    return this.http.delete<IGenericRESTResponse>(this.root + endpoint);
  }
}
