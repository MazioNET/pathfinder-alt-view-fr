import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncestriesComponent } from './ancestries.component';

describe('AncestriesComponent', () => {
  let component: AncestriesComponent;
  let fixture: ComponentFixture<AncestriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncestriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AncestriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
