import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IFilterDialog } from '../types/filter.types';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent {

  tags: string[] = this.filterData.allTags;
  filter: string[] = this.filterData.currentlyAppliedFilters || [];
  disableApplyButton = true;

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public filterData: IFilterDialog
  ) { }

  addToFilter(tag: string) {
    this.filter.push(tag);
  }

  removeFromFilter(tag: string) {
    const index = this.filter.indexOf(tag);
    if (index !== -1) {
      this.filter.splice(index, 1);
    }
    this.disableApplyButton = false;
  }

  onApplyClick(): void {
    this.dialogRef.close(this.filter);
  }

  onClearClick(): void {
    this.disableApplyButton = false;
    this.filter = [];
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
