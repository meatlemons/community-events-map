export interface ICommunityEvent {
    Id?: string 
    title?: string
    startDateTime?: Date
    expiryDateTime?: Date
    description?: string
    contactEmail?: string
    contactTelephone?: string
    tags?: string[]
    geolocation?: google.maps.LatLngLiteral
}

export interface IAddress {
    addressOne: string
    addressTwo: string
    city: string
    county: string
    country: string
    postCode: string
}

export interface ICommunityEventResponse {
    code: number
    message: string
}

export interface ICommunityEventListResponse extends ICommunityEventResponse {
    result: ICommunityEvent[]
}