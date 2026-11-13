import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn<(query: string) => MediaQueryList>((query) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<(event: Event) => boolean>(() => false),
  })),
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'night';
});

afterEach(() => {
  cleanup();
});
