import { Component, OnInit } from '@angular/core';
import { CommunityEventService } from '../services/community-event.service';
import { ICommunityEvent } from '../types/community-event.types';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  // lat/long for Ipswich
  public center: google.maps.LatLngLiteral = {
    lat: 52.0567,
    lng: 1.1482
  };
  public zoom: number = 10;

  constructor(private readonly _communityEventService: CommunityEventService) { }

  ngOnInit(): void {
  }

  onCreateClick(value: ICommunityEvent): void {
    this._communityEventService.createEvent(value)
  }

  onUpdateClick(eventId: string, value: ICommunityEvent): void {
    this._communityEventService.updateEvent(eventId, value);
  }

  onDeleteClick(eventId: string): void {
    this._communityEventService.deleteEvent(eventId);
  }

  onPinClick(eventId: string): void {
    // render popup that includes details?
  }

}
