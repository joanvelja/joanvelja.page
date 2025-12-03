import { cn } from './utils';

describe('cn utility', () => {
  it('merges classes correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2');
  });

  it('handles conditional classes', () => {
    expect(cn('c1', true && 'c2', false && 'c3')).toBe('c1 c2');
  });

  it('merges tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
