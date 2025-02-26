import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatSkillsComponent } from './feat-skills.component';

describe('FeatSkillsComponent', () => {
  let component: FeatSkillsComponent;
  let fixture: ComponentFixture<FeatSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatSkillsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
