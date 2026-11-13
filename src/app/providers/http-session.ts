import { httpClient } from '@/shared/api/http-client'
import { refreshAccessToken } from '@/modules/auth/session'
import { useSessionStore } from '@/modules/auth/store'

/**
 * Wires the in-memory session into the shared HTTP client.
 * When a refresh fails mid-session the store is cleared; route guards then redirect
 * to /entrar?next=<route> (CLAUDE.md §8.4).
 */
export function setupHttpSession() {
  httpClient.configure({
    getAccessToken: () => useSessionStore.getState().accessToken,
    refreshAccessToken,
    onSessionExpired: () => {
      const { status, clear } = useSessionStore.getState()
      if (status === 'authenticated') clear('expired')
    },
  })
}
