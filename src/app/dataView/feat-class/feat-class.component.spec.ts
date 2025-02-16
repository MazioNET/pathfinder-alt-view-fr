import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatClassComponent } from './feat-class.component';

describe('FeatClassComponent', () => {
  let component: FeatClassComponent;
  let fixture: ComponentFixture<FeatClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatClassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
