import { FormControl, Validators } from "@angular/forms";
import { TIME_INPUT_VALIDATION } from "./map/regex";

// timezones
export const BST_HOURS_OFFSET = 1;
export const EST_HOURS_OFFSET = -5;
export const PST_HOURS_OFFSET = -8;

// UI timings
export const SNACKBAR_DURATION_DEFAULT = 3000;

// UI dimensions (outside SCSS)
export const DIALOG_MIN_HEIGHT = "25vh";
export const DIALOG_MAX_HEIGHT = "50vh";
export const DIALOG_MIN_WIDTH = "60vw";
export const DIALOG_MAX_WIDTH = "80vw";

// Create Form
export const DEFAULT_FORM_STATE = {
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
  }