import { Observable, of } from 'rxjs';
import { ICommunityEvent } from '../types/community-event.types';

export const MOCK_EVENTS = of([
    {
        "Id": 16,
        "title": "Ipswich 5K",
        "startDateTime": "2022-04-12T08:00:00.000Z",
        "expiryDateTime": "2022-04-12T11:00:00.000Z",
        "description": "5K run open to runners of all abilities. Families welcome.",
        "contactEmail": "ipswich5k@fake-email.com",
        "contactTelephone": "+447123456789",
        "geolocation": {
            "x": 52.0638833,
            "y": 1.1568073
        },
        "tags": [
            "family-friendly",
            "running",
            "exercise",
            "outside"
        ]
    },
    {
        "Id": 17,
        "title": "Intro to Climbing",
        "startDateTime": "2022-04-19T16:00:00.000Z",
        "expiryDateTime": "2022-04-19T18:00:00.000Z",
        "description": "Learn to climb!",
        "contactEmail": "climbing@notreal.com",
        "contactTelephone": "+44123456789",
        "geolocation": {
            "x": 52.0279362,
            "y": 1.2177603
        },
        "tags": [
            "free"
        ]
    },
    {
        "Id": 18,
        "title": "Meet a capybara!",
        "startDateTime": "2022-04-18T10:00:00.000Z",
        "expiryDateTime": "2022-04-24T15:00:00.000Z",
        "description": "w/c 24/04 you can come and meet one of our capybaras at Jimmy's Farm!",
        "contactEmail": "capybaras@capybaras.com",
        "contactTelephone": "+441473123456",
        "geolocation": {
            "x": 52.0198428,
            "y": 1.123149
        },
        "tags": [
            "animals",
            "family-friendly"
        ]
    }
]);