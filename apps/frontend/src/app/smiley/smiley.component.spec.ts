import { TestBed } from '@angular/core/testing';
import { describe, expect, test } from 'vitest';

import { SmileyComponent } from './smiley.component';

describe('SmileyComponent', () => {
  test('renders the CSS smiley structure', async () => {
    await TestBed.configureTestingModule({
      imports: [SmileyComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SmileyComponent);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.smiley-face')).not.toBeNull();
    expect(compiled.querySelectorAll('.eye')).toHaveLength(2);
    expect(compiled.querySelector('.mouth')).not.toBeNull();
    expect(compiled.querySelector('.tongue')).not.toBeNull();
    expect(compiled.querySelector('.face-cutout')).not.toBeNull();
  });
});
