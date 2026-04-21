export const MOBILE_VIEWPORT_WIDTH = 768;

export enum WhatsAppNavigationMode {
  SameTab = 'same_tab',
  NewTab = 'new_tab',
  Blocked = 'blocked',
}

interface WindowOpenResult {
  closed?: boolean;
}

interface OpenWhatsAppOrderParams {
  url: string;
  viewportWidth: number;
  openNewTab: (url: string) => WindowOpenResult | null;
  replaceLocation: (url: string) => void;
}

export function openWhatsAppOrder({
  url,
  viewportWidth,
  openNewTab,
  replaceLocation,
}: OpenWhatsAppOrderParams) {
  if (viewportWidth <= MOBILE_VIEWPORT_WIDTH) {
    replaceLocation(url);

    return {
      mode: WhatsAppNavigationMode.SameTab,
      blockedUrl: null,
    };
  }

  const popup = openNewTab(url);

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    return {
      mode: WhatsAppNavigationMode.Blocked,
      blockedUrl: url,
    };
  }

  return {
    mode: WhatsAppNavigationMode.NewTab,
    blockedUrl: null,
  };
}
