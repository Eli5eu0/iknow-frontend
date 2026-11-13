import { create } from 'zustand'

import type { ApiError } from '@/shared/api/errors'
import type { AuthResponse, UserPublic } from '@/modules/auth/types'

/**
 * In-memory session store (CLAUDE.md §1.3 and §8).
 * NOT persisted: no localStorage, sessionStorage or JS-readable cookies.
 * The refresh token lives only in the backend's HttpOnly cookie.
 */

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

/** Why the session ended; lets guards skip `?next=` after an explicit logout. */
export type SessionEndReason = 'logout' | 'expired' | null

interface SessionState {
  status: SessionStatus
  accessToken: string | null
  csrfToken: string | null
  user: UserPublic | null
  bootstrapError: ApiError | null
  endReason: SessionEndReason
  /**
   * Where to go right after login/registration when it is not the role's home page
   * (D07: a company with an incomplete profile goes to onboarding). Overrides `?next=`.
   */
  landingPath: string | null

  setAuth: (auth: AuthResponse) => void
  /** Login/registration succeeded: store the session and mark it authenticated. */
  signIn: (auth: AuthResponse, landingPath?: string | null) => void
  clearLandingPath: () => void
  setUser: (user: UserPublic) => void
  setCsrfToken: (csrfToken: string) => void
  setLoading: () => void
  setBootstrapError: (error: ApiError) => void
  markUnauthenticated: () => void
  clear: (reason: Exclude<SessionEndReason, null>) => void
}

const emptySession = {
  accessToken: null,
  csrfToken: null,
  user: null,
} as const

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'idle',
  ...emptySession,
  bootstrapError: null,
  endReason: null,
  landingPath: null,

  setAuth: (auth) =>
    set({
      accessToken: auth.access_token,
      csrfToken: auth.csrf_token,
      user: auth.user,
      endReason: null,
    }),
  signIn: (auth, landingPath = null) =>
    set({
      landingPath,
      accessToken: auth.access_token,
      csrfToken: auth.csrf_token,
      user: auth.user,
      status: 'authenticated',
      bootstrapError: null,
      endReason: null,
    }),
  clearLandingPath: () => set({ landingPath: null }),
  setUser: (user) => set({ user, status: 'authenticated', bootstrapError: null }),
  setCsrfToken: (csrfToken) => set({ csrfToken }),
  setLoading: () => set({ status: 'loading', bootstrapError: null }),
  setBootstrapError: (error) => set({ status: 'error', bootstrapError: error }),
  markUnauthenticated: () => set({ ...emptySession, status: 'unauthenticated', landingPath: null }),
  clear: (reason) =>
    set({ ...emptySession, status: 'unauthenticated', endReason: reason, landingPath: null }),
}))
