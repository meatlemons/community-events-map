import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IFilterDialog } from '../types/filter.types';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  tags: string[] = this.filterData.allTags;
  filter: string[] = this.filterData.currentlyAppliedFilters || [];

  constructor(
    public dialogRef: MatDialogRef<FilterComponent>,
    @Inject(MAT_DIALOG_DATA) public filterData: IFilterDialog
  ) { }

  ngOnInit(): void {
  }

  addToFilter(tag: string) {
    this.filter.push(tag);
  }

  removeFromFilter(tag: string) {
    const index = this.filter.indexOf(tag);
    if (index !== -1) {
      this.filter.splice(index, 1);
    }
  }

  onApplyClick(): void {
    this.dialogRef.close(this.filter);
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
