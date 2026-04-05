import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Residentes } from './residentes';

describe('Residentes', () => {
  let component: Residentes;
  let fixture: ComponentFixture<Residentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Residentes],
    }).compileComponents();

    fixture = TestBed.createComponent(Residentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
