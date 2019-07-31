import { TestBed } from '@angular/core/testing';

import { GlobalvarsService } from './globalvars.service';

describe('GlobalvarsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalvarsService = TestBed.get(GlobalvarsService);
    expect(service).toBeTruthy();
  });
});
