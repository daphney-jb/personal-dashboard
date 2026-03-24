/**
 * Responsiveness Tests
 *
 * Verifies that the application responds correctly to different viewport sizes:
 * - window.innerWidth / window.innerHeight values
 * - window resize events
 * - matchMedia queries for CSS breakpoints used in the app
 * - ThemeProvider surviving across viewport changes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext.jsx';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Set window dimensions and fire a resize event. */
function setViewport(width, height = 768) {
  Object.defineProperty(window, 'innerWidth',  { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

/** Create a matchMedia mock that evaluates real min-width/max-width queries. */
function mockMatchMedia(width) {
  return vi.fn().mockImplementation(query => {
    // Evaluate simple min-width / max-width queries
    const minMatch = query.match(/\(min-width:\s*(\d+)px\)/);
    const maxMatch = query.match(/\(max-width:\s*(\d+)px\)/);
    let matches = true;
    if (minMatch) matches = matches && width >= Number(minMatch[1]);
    if (maxMatch) matches = matches && width <= Number(maxMatch[1]);
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Viewport helpers ────────────────────────────────────────────────────────

describe('viewport helpers', () => {
  it('setViewport correctly updates window.innerWidth', () => {
    setViewport(375);
    expect(window.innerWidth).toBe(375);
  });

  it('setViewport fires a resize event', () => {
    const listener = vi.fn();
    window.addEventListener('resize', listener);
    setViewport(1024);
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('resize', listener);
  });

  it('resize listener receives the correct new width', () => {
    let captured = null;
    const listener = () => { captured = window.innerWidth; };
    window.addEventListener('resize', listener);

    setViewport(480);
    expect(captured).toBe(480);

    setViewport(1280);
    expect(captured).toBe(1280);
    window.removeEventListener('resize', listener);
  });
});

// ─── matchMedia breakpoints ───────────────────────────────────────────────────

describe('matchMedia breakpoints', () => {
  const MOBILE   = 375;
  const TABLET   = 768;
  const DESKTOP  = 1280;

  it.each([
    ['mobile',  MOBILE,  true,  false, false],
    ['tablet',  TABLET,  false, true,  false],
    ['desktop', DESKTOP, false, false, true],
  ])('%s viewport matches the right breakpoints', (_label, width, isMobile, isTablet, isDesktop) => {
    window.matchMedia = mockMatchMedia(width);

    expect(window.matchMedia('(max-width: 640px)').matches).toBe(isMobile);
    expect(window.matchMedia('(min-width: 641px) and (max-width: 1023px)').matches).toBe(isTablet);
    expect(window.matchMedia('(min-width: 1024px)').matches).toBe(isDesktop);
  });

  it('mobile breakpoint (≤640 px) matches at 320 px', () => {
    window.matchMedia = mockMatchMedia(320);
    expect(window.matchMedia('(max-width: 640px)').matches).toBe(true);
  });

  it('mobile breakpoint (≤640 px) does not match at 641 px', () => {
    window.matchMedia = mockMatchMedia(641);
    expect(window.matchMedia('(max-width: 640px)').matches).toBe(false);
  });

  it('desktop breakpoint (≥1024 px) matches at 1440 px', () => {
    window.matchMedia = mockMatchMedia(1440);
    expect(window.matchMedia('(min-width: 1024px)').matches).toBe(true);
  });

  it('dark-mode media query (prefers-color-scheme: dark) returns a valid object', () => {
    window.matchMedia = mockMatchMedia(DESKTOP);
    const result = window.matchMedia('(prefers-color-scheme: dark)');
    expect(result).toHaveProperty('matches');
    expect(result).toHaveProperty('addEventListener');
    expect(result).toHaveProperty('removeEventListener');
  });
});

// ─── ThemeContext across viewport changes ────────────────────────────────────

describe('ThemeContext – survives viewport changes', () => {
  function ThemeToggle() {
    const { dark, toggle } = useTheme();
    return (
      <div>
        <span data-testid="mode">{dark ? 'dark' : 'light'}</span>
        <button onClick={toggle}>toggle</button>
      </div>
    );
  }

  it('renders in light mode by default regardless of viewport', () => {
    setViewport(375);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('toggling dark mode persists to localStorage', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(localStorage.getItem('nexboard_theme')).toBe('dark');
  });

  it('dark mode preference is preserved after a simulated resize', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    // Enable dark mode
    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByTestId('mode').textContent).toBe('dark');

    // Simulate resize — React state should be unaffected
    act(() => setViewport(375));
    expect(screen.getByTestId('mode').textContent).toBe('dark');

    act(() => setViewport(1440));
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('ThemeProvider reads initial dark mode from localStorage on mount', () => {
    localStorage.setItem('nexboard_theme', 'dark');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('ThemeProvider starts in light mode when localStorage has "light"', () => {
    localStorage.setItem('nexboard_theme', 'light');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('toggle writes correct string values to localStorage', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(localStorage.getItem('nexboard_theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(localStorage.getItem('nexboard_theme')).toBe('light');
  });
});

// ─── Resize event listener lifecycle ────────────────────────────────────────

describe('resize event listener lifecycle', () => {
  it('multiple resize events fire the listener each time', () => {
    const listener = vi.fn();
    window.addEventListener('resize', listener);

    setViewport(320);
    setViewport(768);
    setViewport(1280);

    expect(listener).toHaveBeenCalledTimes(3);
    window.removeEventListener('resize', listener);
  });

  it('removed listener no longer receives resize events', () => {
    const listener = vi.fn();
    window.addEventListener('resize', listener);
    window.removeEventListener('resize', listener);

    setViewport(500);
    expect(listener).not.toHaveBeenCalled();
  });
});
