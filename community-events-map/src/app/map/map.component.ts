import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommunityEventService } from '../services/community-event.service';
import { ICommunityEvent } from '../types/community-event.types';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_MAP_OPTIONS } from './map.defaults';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  public events$: Observable<ICommunityEvent[]>;

  @ViewChild('map', { static: false }) gmap: ElementRef;
  map: google.maps.Map;
  markers: google.maps.Marker[];

  constructor(private readonly _communityEventService: CommunityEventService) { }

  ngOnInit(): void {
    this.events$ = this._communityEventService.getEvents();
    this.events$.subscribe(res => {
      console.log("Events: ", JSON.stringify(res));
    })
    this.markers = [new google.maps.Marker({
      position: DEFAULT_MAP_OPTIONS.center,
      title: "Some Event"
    })]
  }

  ngAfterViewInit(): void {
    this.initMap();
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

  private initMap(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, DEFAULT_MAP_OPTIONS);
    this.markers.forEach(marker => {
      const infoWindow = new google.maps.InfoWindow({ content: this.constructInfoWindowHtml({}) });
      marker.setMap(this.map) 
      marker.addListener("click", () => {
        infoWindow.open({
          anchor: marker,
          map: this.map,
          shouldFocus: false
        });
      });
    });
  }

  // TODO: this should return stringified HTML that uses info from the provided community event
  // private constructInfoWindowHtml(event: ICommunityEvent): string {
  //   return `
  //   <div style="width:400px;height:200px;border-radius:4px;background-color:#fafafa">
  //   ${event.title}
  //   ${event.description}
  //   <!--TODO: More info-->
  //   </div>
  //   `
  // }

  // TODO: Remove this placeholder method
  private constructInfoWindowHtml(event: any): string {
    return `
    <div style="width:400px;height:fit-content;border-radius:4px;">
    <h3>${"Some Title"}</h3>
    ${"Some Description"}
    </div>
    `
  }
}
