import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Confetti } from '../src/components/Confetti';

afterEach(() => { vi.useRealTimers(); });

it('запускает новый залп и убирает его после завершения', () => {
  vi.useFakeTimers();
  const { container, rerender } = render(<Confetti burst={0} />);
  expect(container.querySelector('.confetti')).toBeNull();
  rerender(<Confetti burst={1} />);
  expect(container.querySelector('.confetti')).not.toBeNull();
  act(() => { vi.advanceTimersByTime(1800); });
  rerender(<Confetti burst={2} />);
  act(() => { vi.advanceTimersByTime(200); });
  expect(container.querySelector('.confetti')).not.toBeNull();
  act(() => { vi.advanceTimersByTime(1700); });
  expect(container.querySelector('.confetti')).toBeNull();
  rerender(<Confetti burst={3} />);
  expect(container.querySelector('.confetti')).not.toBeNull();
});
