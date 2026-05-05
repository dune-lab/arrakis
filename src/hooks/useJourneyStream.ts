/**
 * useJourneyStream — SSE hook for real-time journey updates.
 *
 * Opens a Server-Sent Events connection to the imperium service for a given
 * journey and calls `onUpdate` whenever a progress event arrives.
 *
 * @param journeyId - The journey ID to subscribe to.
 * @param token     - Bearer token used as query param for auth.
 * @param onUpdate  - Callback invoked with each parsed update payload.
 */

import { useEffect } from 'react';

const BASE = import.meta.env.VITE_IMPERIUM_URL as string;

type Update = { id: string; currentStep: string; status: string };

export function useJourneyStream(
  journeyId: string,
  token: string,
  onUpdate: (update: Update) => void,
): void {
  useEffect(() => {
    const url = `${BASE}/journeys/${journeyId}/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (e: MessageEvent<string>) => {
      try {
        onUpdate(JSON.parse(e.data) as Update);
      } catch {
        // ignore malformed events
      }
    };

    return () => {
      es.close();
    };
  }, [journeyId, token, onUpdate]);
}
