import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MOCK_EVENTS } from '../mocks/mock.data';

import { FilterDialogComponent } from './filter-dialog.component';

describe('FilterComponent', () => {
  let component: FilterDialogComponent;
  let fixture: ComponentFixture<FilterDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDialogComponent ],
      imports: [
        MatChipsModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable apply button by default', () => {
    const applyButton = fixture.nativeElement.querySelector('.submit-button');
    expect(applyButton.disabled).toBe(true);
  });

  it('should call onCloseClick when close BUTTON is clicked', () => {
    const closeSpy = jest.spyOn(component, 'onCloseClick');
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();
    fixture.detectChanges();
    
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should call onCloseClick when close ICON is clicked', () => {
    const closeSpy = jest.spyOn(component, 'onCloseClick');
    const closeButton = fixture.nativeElement.querySelector('.filter-clear-icon');
    closeButton.click();
    fixture.detectChanges();
    
    expect(closeSpy).toHaveBeenCalled();
  })

  it('should clear filters when clear filter button clicked', () => {
    const tags = component.filter = ["tag1", "tag2", "tag3"];
    expect(component.filter.length).toBe(3);

    const clearFilterButton = fixture.nativeElement.querySelector('.clear-button');
    clearFilterButton.click();
    fixture.detectChanges();

    expect(component.filter.length).toBe(0);
    // only filter should have cleared, not tags
    expect(tags.length).toBe(3);
  });

  it('should show mat hints', () => {
    const hints = fixture.nativeElement.querySelectorAll('mat-hint');
    expect(hints.length).toBe(2);

    expect(hints[0].textContent).toBe("Click a tag to use it in the filter")
    expect(hints[1].textContent).toBe("Click a tag to remove it from filter");
  })
});
