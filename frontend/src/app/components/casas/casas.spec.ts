import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Casas } from './casas';

describe('Casas', () => {
  let component: Casas;
  let fixture: ComponentFixture<Casas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Casas],
    }).compileComponents();

    fixture = TestBed.createComponent(Casas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
