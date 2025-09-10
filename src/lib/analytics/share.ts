/**
 * Analytics helpers for share functionality
 */

interface ShareEvent {
  kind: 'rune' | 'number' | 'compat';
  method?: 'webshare' | 'copy' | 'download';
  context?: string;
}

/**
 * Track share events using Google Analytics
 */
export function trackShareEvent(event: ShareEvent) {
  if (typeof window === 'undefined') return;
  
  // Check if gtag is available
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'share_event', {
      event_category: 'sharing',
      event_label: `${event.kind}_${event.method || 'unknown'}`,
      custom_map: {
        share_kind: event.kind,
        share_method: event.method || 'unknown',
        share_context: event.context || 'unknown'
      }
    });
  }
}

/**
 * Track share open events
 */
export function trackShareOpen(kind: 'rune' | 'number' | 'compat', context: string = 'ritual_result') {
  trackShareEvent({ kind, context });
}

/**
 * Track share download events
 */
export function trackShareDownload(kind: 'rune' | 'number' | 'compat', context: string = 'ritual_result') {
  trackShareEvent({ kind, method: 'download', context });
}

/**
 * Track share link events
 */
export function trackShareLink(kind: 'rune' | 'number' | 'compat', method: 'webshare' | 'copy', context: string = 'ritual_result') {
  trackShareEvent({ kind, method, context });
}
