import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatAncestryComponent } from './feat-ancestry.component';

describe('FeatAncestryComponent', () => {
  let component: FeatAncestryComponent;
  let fixture: ComponentFixture<FeatAncestryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatAncestryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatAncestryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
