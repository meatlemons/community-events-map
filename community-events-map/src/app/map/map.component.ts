import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommunityEventService } from '../services/community-event.service';
import { IAddress, ICommunityEvent, ICommunityEventCreateRequest, ICommunityEventFormData, IGenericRESTResponse, IPoint, ITime } from '../types/community-event.types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_DETAIL_ZOOM, DEFAULT_MAP_OPTIONS } from './map.defaults';
import { COUNTIES } from './form.data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TIME_INPUT_VALIDATION } from './regex';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MOCK_EVENTS } from '../mocks/mock.data';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../filter/filter-dialog.component';
import { BST_HOURS_OFFSET, DIALOG_MAX_HEIGHT, DIALOG_MAX_WIDTH, DIALOG_MIN_HEIGHT, DIALOG_MIN_WIDTH, SNACKBAR_DURATION_DEFAULT } from '../constants';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
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
  searchQuery: string;
  searchResults$: Observable<ICommunityEvent[]>;
  currentlyAppliedFilters: string[];
  eventsForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    startTime: new FormControl('', [Validators.required, Validators.pattern(TIME_INPUT_VALIDATION)]),
    endDate: new FormControl({ value: '', disabled: true }, Validators.required),
    endTime: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern(TIME_INPUT_VALIDATION)]),
    description: new FormControl(),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(13)]),
    addressOne: new FormControl('', Validators.required),
    addressTwo: new FormControl(),
    city: new FormControl('', Validators.required),
    county: new FormControl('', Validators.required),
    postCode: new FormControl('', Validators.required),
    tags: new FormControl()
  });

  mockEvents$ = MOCK_EVENTS;

  constructor(
    private readonly _communityEventService: CommunityEventService,
    private _snackbar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getAndFilterEvents()
      .subscribe(events => {
        this.markers = [];
        events.forEach(event => {
          this.markers.push(new google.maps.Marker({
            position: { lat: event.geolocation?.x, lng: event.geolocation?.y },
            title: event.title
          }));
          // store tags for use in filtering
          this.pullTagData(event.tags);
        });

        this.markers.forEach(marker => {
          // set up info windows
          const communityEvent = events.find(event => event.title === marker.getTitle());
          const infoWindow = new google.maps.InfoWindow({ content: this.constructInfoWindowHtml(communityEvent!) });
          marker.setMap(this.map) // not needed?
          marker.addListener("click", () => {
            infoWindow.open({
              anchor: marker,
              map: this.map,
              shouldFocus: false
            });
          });
          // close all info windows when the map is clicked
          google.maps.event.addListener(this.map, "click", () => {
            infoWindow.close();
          });
        });
      });
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      minHeight: DIALOG_MIN_HEIGHT,
      maxHeight: DIALOG_MAX_HEIGHT,
      minWidth: DIALOG_MIN_WIDTH,
      maxWidth: DIALOG_MAX_WIDTH,
      data: {
        allTags: this.tagList,
        currentlyAppliedFilters: this.currentlyAppliedFilters
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.currentlyAppliedFilters = result;
      this.getAndFilterEvents(null, result);
    });
  }

  openDeleteDialog(eventToDelete: ICommunityEvent): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: eventToDelete
    });

    dialogRef.afterClosed().subscribe(result => {
      // only show a message if the call to delete API is made 
      if (result) {
        this._snackbar.open(result, "", { duration: SNACKBAR_DURATION_DEFAULT });
        this.getAndFilterEvents();
      }
    })
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  // called on list item click
  centerOnEvent(eventGeoLocation: IPoint): void {
    this.map.setCenter({
      lat: eventGeoLocation.x,
      lng: eventGeoLocation.y
    });
    this.map.setZoom(DEFAULT_DETAIL_ZOOM);
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

    console.log("start time: ", startTime.hours + ":" + startTime.minutes);
    console.log("end time:   ", endTime.hours + ":" + endTime.minutes);

    // workaround mat date picker limitation
    // by setting hours/minutes using above values
    // hacky workaround to account for timezone shift 
    // in conversion to mySQL DATETIME
    // (1 hour each way, presumably due to UTC vs BST)
    formData.startDate.setHours(startTime.hours, startTime.minutes);
    formData.endDate.setHours(endTime.hours, startTime.minutes);

    // validate date/times
    if (formData.startDate > formData.endDate) {
      this._snackbar.open("Start Date/Time must be before End Date/Time. Please update the form.");
      this.eventsForm.setErrors( { incorrect: true });
      return new Promise<void>(null);
    }

    if (Math.floor(new Date(formData.startDate).getTime()) < Date.now()) {
      this._snackbar.open("Start Date/Time can't be in the past. Please update the form.");
      this.eventsForm.setErrors( { incorrect: true });
      return new Promise<void>(null);
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

    console.log("create request: ", createRequest);

    // call create service
    this._communityEventService.createEvent(createRequest).subscribe(createResponse => {
      this._snackbar.open(`${createResponse.message}! Please refresh to update the map.`, "", { duration: SNACKBAR_DURATION_DEFAULT });
      this.getAndFilterEvents().subscribe(events => {
        const newEvent = events.find(event => event.title === formData.title);
        console.log("new event: ", newEvent);
        if (newEvent) {
          setTimeout(() => { this.markers.push(new google.maps.Marker({
              position: { lat: createRequest.geolocation?.x, lng: createRequest.geolocation?.y },
              title: createRequest.title,
              map: this.map
            }));
            // it'd be best to factor this out into its own method
            // instead of repeating the code from ngOnInit
            // but I'm keeping it this way due to time constraints
            const marker = this.markers.find(marker => marker.getTitle() === newEvent.title);
            const newInfoWindow = new google.maps.InfoWindow({ content: this.constructInfoWindowHtml(newEvent) });
            marker.setMap(this.map); // not needed?
            marker.addListener("click", () => {
              newInfoWindow.open({
                anchor: marker,
                map: this.map,
                shouldFocus: false
              })
            });
            // close all info windows when the map is clicked
            google.maps.event.addListener(this.map, "click", () => {
              newInfoWindow.close();
            });
          }, 0);
        }
        else {
          this._snackbar.open("Error adding marker for new event. Please refresh page.", "", { duration: SNACKBAR_DURATION_DEFAULT })
        }
      });
    });
  }

  searchForEvent() {
    this.getAndFilterEvents(this.searchQuery);
    this.searchQuery = "";
  }

  clearSearch() {
    this.getAndFilterEvents();
  }

  enableEndDateTimeFields(): void {
    const controls = this.eventsForm.controls;
    controls.endDate.enable();
    controls.endTime.enable();
  }

  private getAndFilterEvents(searchQuery?: string, tagFilter?: string[]): Observable<ICommunityEvent[]> {
    if (tagFilter || searchQuery) {
      if (searchQuery) {
        this.events$ = this._communityEventService.getEvents().pipe(
          map(events => events.filter(event => this.isInPast(event.expiryDateTime) && event.title.toLowerCase().includes(searchQuery.toLowerCase())))
        );
      }
      if (tagFilter) {
        this.events$ = this._communityEventService.getEvents().pipe(
          map(events => events.filter(event => this.isInPast(event.expiryDateTime))),
          map(events => events.filter(event => tagFilter.every(filter => event.tags.includes(filter))))
        );
      }
    }
    else {
      this.events$ = this._communityEventService.getEvents().pipe(
        map(events => events.filter(event => this.isInPast(event.expiryDateTime)))
      );
    }
    return this.events$;
  }

  private isInPast(date: Date): boolean {
    return Math.floor(new Date(date).getTime()) > Date.now();
  }

  private compareDates(startDate: Date, endDate: Date): boolean {
    return startDate > endDate;
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
        const tags = tagsInput.replace(", ", ",").replace(' ', '-').split(",");
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
    // offset one hour between UTC and BST
    // at full scale, the application
    // would detect the user's locale
    // and handle accordingly
    date.setHours(date.getHours() + BST_HOURS_OFFSET);
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

  // pushes tags from each event into an array
  // then removes duplicates using a Set
  private pullTagData(tags: string[]): void {
    tags.forEach(tag => {
      this.tagList.push(tag);
      this.tagList = [...new Set(this.tagList)]
    });
  }

  private initMap(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, DEFAULT_MAP_OPTIONS);
  }

  private constructInfoWindowHtml(event: ICommunityEvent): string {
    if (event) {
      return `
      <div style="width:fit-content;height:fit-content;max-width:250px;max-height:150px;border-radius:4px;">
        <h3 style="text-transform: capitalize;">${event.title}</h3>
        ${event.description !== 'null' ? event.description : ""}
        <br>
        <a href="mailto:${event.contactEmail}">${event.contactEmail}<a/>
        <br>
        <a href="tel:${event.contactTelephone}">${event.contactTelephone}</a>
        <br>
        <a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${event.geolocation.x},${event.geolocation.y}">Directions</a>
        <br>
        <br>
        Start Time: ${new Date(event.startDateTime).toUTCString()}
        <br>
        End Time:  ${new Date(event.expiryDateTime).toUTCString()}
      </div>
      `
    }
    return `<span>Error constructing info window for event.</span>`;
  }
}
