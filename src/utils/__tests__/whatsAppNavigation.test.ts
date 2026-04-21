import { describe, expect, it, vi } from 'vitest';
import {
  MOBILE_VIEWPORT_WIDTH,
  openWhatsAppOrder,
  WhatsAppNavigationMode,
} from '../whatsAppNavigation';

describe('openWhatsAppOrder', () => {
  it('uses same-tab navigation on mobile viewports to avoid popup blockers', () => {
    const openNewTab = vi.fn();
    const replaceLocation = vi.fn();

    const result = openWhatsAppOrder({
      url: 'https://wa.me/123',
      viewportWidth: MOBILE_VIEWPORT_WIDTH,
      openNewTab,
      replaceLocation,
    });

    expect(openNewTab).not.toHaveBeenCalled();
    expect(replaceLocation).toHaveBeenCalledWith('https://wa.me/123');
    expect(result).toEqual({
      mode: WhatsAppNavigationMode.SameTab,
      blockedUrl: null,
    });
  });

  it('opens a new tab on wider viewports when popups are allowed', () => {
    const openNewTab = vi.fn(() => ({ closed: false }));
    const replaceLocation = vi.fn();

    const result = openWhatsAppOrder({
      url: 'https://wa.me/123',
      viewportWidth: MOBILE_VIEWPORT_WIDTH + 1,
      openNewTab,
      replaceLocation,
    });

    expect(openNewTab).toHaveBeenCalledWith('https://wa.me/123');
    expect(replaceLocation).not.toHaveBeenCalled();
    expect(result).toEqual({
      mode: WhatsAppNavigationMode.NewTab,
      blockedUrl: null,
    });
  });

  it('returns a blocked result on desktop when a popup could not be opened', () => {
    const openNewTab = vi.fn(() => null);
    const replaceLocation = vi.fn();

    const result = openWhatsAppOrder({
      url: 'https://wa.me/123',
      viewportWidth: 1280,
      openNewTab,
      replaceLocation,
    });

    expect(result).toEqual({
      mode: WhatsAppNavigationMode.Blocked,
      blockedUrl: 'https://wa.me/123',
    });
  });
});
