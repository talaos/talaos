import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployModal } from './deploy.modal';

describe('DeployComponent', () => {
  let component: DeployModal;
  let fixture: ComponentFixture<DeployModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeployModal ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
