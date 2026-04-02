import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasasComponent } from './casas';

describe('Casas', () => {
  let component: CasasComponent;
  let fixture: ComponentFixture<CasasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CasasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
