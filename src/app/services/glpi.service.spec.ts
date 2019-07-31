import { TestBed } from '@angular/core/testing';

import { GlpiService } from './glpi.service';

describe('GlpiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlpiService = TestBed.get(GlpiService);
    expect(service).toBeTruthy();
  });
});
