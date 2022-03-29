export interface ICommunityEvent {
    readonly Id: number 
    title: string
    startDateTime: Date
    expiryDateTime: Date
    description: string
    contactEmail: string
    contactTelephone: string
    geolocation: IPoint
    tags: string[]
}

export interface ICommunityEventCreateRequest {
    title: string
    startDateTime: string
    expiryDateTime?: string
    description?: string
    contactEmail: string
    contactTelephone: string
    geolocation?: IPoint
    tags: string[]
}

export interface ICommunityEventUpdateRequest {
    title?: string
    startDateTime?: Date
    expiryDateTime?: Date
    description?: string
    contactEmail?: string
    contactTelephone?: string
    geolocation?: IPoint
    tags?: string[]
}

export interface IAddress {
    addressOne: string
    addressTwo?: string
    city: string
    county: string
    postCode: string
}

export interface ICommunityEventFormData {
    title: string,
    startDate: Date,
    startTime: string,
    endDate: Date,
    endTime: string,
    description: string,
    email: string,
    phone: string,
    addressOne: string,
    addressTwo?: string,
    city: string,
    county: string,
    postCode: string,
    tags: string
}

export interface IGenericRESTResponse {
    code: number
    message: string
}

export interface ICommunityEventRESTResponse {
    EventID: number,
    EventTitle: string,
    StartDateTime: Date,
    ExpiryDateTime: Date,
    Description: string,
    ContactEmail: string,
    ContactTelephone: string,
    GeoLocation: IPoint,
    Tags: string
}

export interface ICommunityEventListResponse extends IGenericRESTResponse {
    result: ICommunityEventRESTResponse[]
}

export interface IPoint {
    x: number,
    y: number
}

export interface ITime {
    hours: number,
    minutes: number
}