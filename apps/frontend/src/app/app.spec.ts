import { TestBed } from '@angular/core/testing';
import { describe, expect, test, beforeEach } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  test('renders the app toolbar title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-title')?.textContent).toContain(
      'PDR.cloud Users',
    );
  });
});
