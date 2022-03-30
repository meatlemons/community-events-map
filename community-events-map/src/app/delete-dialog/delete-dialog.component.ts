import { Component, Inject } from '@angular/core';
import { ICommunityEvent } from '../types/community-event.types';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommunityEventService } from '../services/community-event.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {

  disableDelete$ = new BehaviorSubject(true);

  constructor(
    private _communityEventService: CommunityEventService,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public eventToDelete: ICommunityEvent
  ) { }

  // only enable button after 2 seconds to avoid
  // accidental deletion of events
  enableDeleteButton(): BehaviorSubject<boolean> {
    setTimeout(() => {
      this.disableDelete$.next(false)
    }, 2000);
    return this.disableDelete$;
  }

  onConfirmClick(): void {
    try {
      this._communityEventService.deleteEvent(this.eventToDelete.Id.toString()).subscribe(deleteResponse => {
        if (deleteResponse.message === "Success") {
          this.dialogRef.close(`${deleteResponse.message}: Deleted Event ${this.eventToDelete.title}`);
        } else {
          this.dialogRef.close(`Delete Event failed with: ${deleteResponse.message}`);
        }
      })
    }
    catch {
      this.dialogRef.close(`Something went wrong...`);
    }
  }

  onCloseClick(): void {
   this.dialogRef.close(); 
  }
}
