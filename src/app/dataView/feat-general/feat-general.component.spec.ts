import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatGeneralComponent } from './feat-general.component';

describe('FeatGeneralComponent', () => {
  let component: FeatGeneralComponent;
  let fixture: ComponentFixture<FeatGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatGeneralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
