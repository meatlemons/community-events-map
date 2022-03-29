import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommunityEventService } from '../services/community-event.service';
import { IAddress, ICommunityEvent, ICommunityEventCreateRequest, ICommunityEventFormData, IGenericRESTResponse, IPoint, ITime } from '../types/community-event.types';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_MAP_OPTIONS } from './map.defaults';
import { COUNTIES } from './form.data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TIME_INPUT_VALIDATION } from './regex';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) gmap: ElementRef;

  events$: Observable<ICommunityEvent[]>;
  map: google.maps.Map;
  markers: google.maps.Marker[] = [];
  tagList: string[] = [];
  minDate = new Date(Date.now());
  counties = COUNTIES;
  eventsForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    startTime: new FormControl('', [Validators.required, Validators.pattern(TIME_INPUT_VALIDATION)]),
    endDate: new FormControl('', Validators.required),
    endTime: new FormControl('', [Validators.required, Validators.pattern(TIME_INPUT_VALIDATION)]),
    description: new FormControl(),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    addressOne: new FormControl('', Validators.required),
    addressTwo: new FormControl(),
    city: new FormControl('', Validators.required),
    county: new FormControl('', Validators.required),
    postCode: new FormControl('', Validators.required),
    tags: new FormControl()
  });

  constructor(
    private readonly _communityEventService: CommunityEventService,
    private _snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getAndFilterEvents();
    this.events$.subscribe(events => {
      events.forEach(event => {
        this.markers.push(new google.maps.Marker({
          position: { lat: event.geolocation?.x, lng: event.geolocation?.y },
          title: event.title
        }));
        // TODO: BUG - displays multiple info panels
        this.markers.forEach(marker => {
          const infoWindow = new google.maps.InfoWindow({ content: this.constructInfoWindowHtml(event) });
          marker.setMap(this.map) 
          marker.addListener("click", () => {
            infoWindow.open({
              anchor: marker,
              map: this.map,
              shouldFocus: false
            });
          });
        });
        this.pullTagData(event.tags);
      });
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onUpdateClick(eventId: string, value: ICommunityEvent): void {
    this._communityEventService.updateEvent(eventId, value);
  }

  onDeleteClick(eventId: string): void {
    this._communityEventService.deleteEvent(eventId);
  }

  // called on list item click
  centerOnEvent(eventGeoLocation: IPoint): void {
    this.map.setCenter({
      lat: eventGeoLocation.x,
      lng: eventGeoLocation.y
    });
  }

  // TODO: get form data type
  async submitForm(): Promise<void> {
    const formData: ICommunityEventFormData = this.eventsForm.value;

    // map string timestamp to ITime
    const startTime: ITime = this.splitHoursMinutes(formData.startTime);
    const endTime: ITime = this.splitHoursMinutes(formData.endTime);
    const tags = this.tagsInputToArray(formData.tags);
    const address: IAddress = {
      ...formData
    }

    const geolocation: IPoint = await this.addressToLatLng(address);

    // workaround mat date picker limitation
    // by setting hours/minutes using above values
    formData.startDate.setHours(startTime.hours);
    formData.startDate.setMinutes(startTime.minutes);
    formData.endDate.setHours(endTime.hours);
    formData.endDate.setMinutes(endTime.minutes);

    // validate date/times
    if (formData.startDate > formData.endDate) {
      this._snackbar.open("Start Date can't be before end date. Setting expiry date to 24h from start date.");
      formData.endDate = new Date(formData.endDate.setDate(formData.endDate.getDate() + 1));
    }

    const createRequest: ICommunityEventCreateRequest = {
      title: formData.title,
      startDateTime: this.mySqlDateConverter(formData.startDate),
      expiryDateTime: this.mySqlDateConverter(formData.endDate),
      description: formData.description,
      contactEmail: formData.email,
      contactTelephone: formData.phone,
      geolocation,
      tags
    };

    // call create service
    this._communityEventService.createEvent(createRequest).subscribe(createResponse => {
      this._snackbar.open(createResponse.message, "", { duration: 5000 });
    });
    // retrieve events to keep list up to date
    this.getAndFilterEvents();

    // TODO: try and clean this up
    this.events$.subscribe(() => {});
  }

  private getAndFilterEvents() {
    this.events$ = this._communityEventService.getEvents().pipe(
      map(events => events.filter(event => this.isInPast(event.expiryDateTime)))
    );
  }

  private isInPast(date: Date): boolean {
    return Math.floor(new Date(date).getTime()) > Date.now();
  }

  private splitHoursMinutes(time: string): ITime {
    if (time !== null) {
      try {
        const splitTime: string[] = time.split(":");
        return {
          hours: parseInt(splitTime[0]),
          minutes: parseInt(splitTime[1])
        }
      }
      catch {
        throw new Error("Couldn't split hours and minutes");
      }
    } else {
      return {
        hours: 0,
        minutes: 0
      }
    }
  }

  private tagsInputToArray(tagsInput: string): string[] {
    if (tagsInput !== null && tagsInput !== "") {
      try {
        // regex used to strip out whitespace
        // before converting to comma separated list
        const tags = tagsInput.replace(/\s+/g, '').split(",");

        // workaround sql fussiness around json data type
        return tags.map(tag => "\"" + tag + "\"")
      }
      catch {
        throw new Error("Couldn't split tags");
      }
    } else {
      return []
    }
  }

  private mySqlDateConverter(date: Date): string {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }

  private addressToLatLng(address: IAddress): Promise<IPoint> {
    const stringifiedAddress: string = [address.addressOne, address.addressTwo, address.city, address.county, address.postCode].join();
    const geocoder: google.maps.Geocoder = new google.maps.Geocoder();
    
    try {
      return new Promise(function(resolve) {
        geocoder.geocode({ address: stringifiedAddress },
          function(results, status) {
            if (status !== "ZERO_RESULTS") {
              resolve({
                x: results![0].geometry.location.lat(),
                y: results![0].geometry.location.lng()
              });
            } else {
              resolve({
                x: 0,
                y: 0
              });
            }
          });
      })
    } catch {
      throw new Error("Couldn't convert address to lat/long");
    }
  }

  // pulls tags from an event and pushes into
  // tagList after stripping out duplicates
  private pullTagData(tags: string[]): void {
    let nonUniqueTags: string[] = [];
    tags.forEach(tag => {
      nonUniqueTags.push(tag);
      this.tagList = [...new Set(nonUniqueTags)]
    })
  }

  private initMap(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, DEFAULT_MAP_OPTIONS);
  }

  private constructInfoWindowHtml(event: ICommunityEvent): string {
    return `
    <div style="width:fit-content;height:fit-content;max-width:250px;max-height:150px;border-radius:4px;">
      <h3 style="text-transform: capitalize;">${event.title}</h3>
      ${event.description !== 'null' ? event.description : ""}
      <br>
      <a href="mailto:${event.contactEmail}">${event.contactEmail}<a/>
      <br>
      <a href="tel:${event.contactTelephone}">${event.contactTelephone}</a>
      <br>
      <a target="_blank" href="https://www.google.com/maps/dir/?api=1&desination=${event.geolocation.x},${event.geolocation.y}&dir_action=navigate">Directions</a>
    </div>
    `
  }
}
