import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
