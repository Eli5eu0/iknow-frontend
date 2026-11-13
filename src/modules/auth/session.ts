import { isApiError } from '@/shared/api/errors'
import { httpClient } from '@/shared/api/http-client'
import { paths } from '@/app/router/paths'
import { authApi } from '@/modules/auth/api'
import { companiesApi } from '@/modules/companies/api'
import { useSessionStore } from '@/modules/auth/store'
import type { AuthResponse, LoginRequest, RegisterRequest, UserPublic } from '@/modules/auth/types'

/** Name of the cross-tab lock that serialises refreshes (refresh tokens rotate). */
const REFRESH_LOCK = 'iknow-auth-refresh'

function isSessionRejected(error: unknown): boolean {
  return isApiError(error) && error.kind === 'http' && (error.status === 401 || error.status === 403)
}

async function fetchCsrfToken(): Promise<string> {
  const { csrf_token } = await authApi.getCsrf()
  useSessionStore.getState().setCsrfToken(csrf_token)
  return csrf_token
}

async function performRefresh(): Promise<string | null> {
  const memoryCsrf = useSessionStore.getState().csrfToken

  try {
    const csrf = memoryCsrf ?? (await fetchCsrfToken())
    try {
      const auth = await authApi.refresh(csrf)
      useSessionStore.getState().setAuth(auth)
      return auth.access_token
    } catch (error) {
      // The in-memory CSRF token can be stale if another tab rotated the shared cookie.
      if (memoryCsrf && isApiError(error) && error.status === 403) {
        const auth = await authApi.refresh(await fetchCsrfToken())
        useSessionStore.getState().setAuth(auth)
        return auth.access_token
      }
      throw error
    }
  } catch (error) {
    if (isSessionRejected(error)) return null
    throw error
  }
}

/**
 * Renews the access token. Used by the HTTP client, which already makes it single-flight
 * inside this tab; the Web Locks API (when available) serialises it across tabs so two
 * tabs never present the same rotating refresh token.
 */
export async function refreshAccessToken(): Promise<string | null> {
  return withRefreshLock(performRefresh)
}

/** Runs `task` under the cross-tab lock when the Web Locks API exists. */
async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    return navigator.locks.request(REFRESH_LOCK, () => task())
  }
  return task()
}

let bootstrapInFlight: Promise<void> | null = null

/**
 * App start-up (CLAUDE.md §8): the access token is lost on reload, so try to renew it
 * from the HttpOnly cookie and then load the user from GET /auth/me.
 * Single-flight, so React StrictMode's double effects do not refresh twice.
 */
export function bootstrapSession(): Promise<void> {
  if (!bootstrapInFlight) {
    bootstrapInFlight = runBootstrap().catch((error: unknown) => {
      bootstrapInFlight = null
      throw error
    })
  }
  return bootstrapInFlight
}

async function runBootstrap(): Promise<void> {
  const store = useSessionStore.getState()
  store.setLoading()

  try {
    const token = await httpClient.refreshSession()
    if (!token) {
      useSessionStore.getState().markUnauthenticated()
      return
    }
    const user = await authApi.me()
    useSessionStore.getState().setUser(user)
  } catch (error) {
    if (isSessionRejected(error)) {
      useSessionStore.getState().markUnauthenticated()
      return
    }
    if (isApiError(error)) {
      useSessionStore.getState().setBootstrapError(error)
      bootstrapInFlight = null
      return
    }
    throw error
  }
}

/** Retries a failed start-up (e.g. backend unreachable). */
export function retryBootstrap(): Promise<void> {
  bootstrapInFlight = null
  return bootstrapSession()
}

/**
 * Signs in and stores the session in memory. The AuthResponse already carries the same
 * UserPublic as GET /auth/me, so no extra request is made. Errors reach the form.
 */
export async function login(credentials: LoginRequest): Promise<UserPublic> {
  return completeSignIn(await authApi.login(credentials))
}

/** Creates the account; the backend signs the new user in straight away (201 + cookie). */
export async function register(payload: RegisterRequest): Promise<UserPublic> {
  return completeSignIn(await authApi.register(payload))
}

/**
 * Stores the tokens, decides the landing page, then marks the session authenticated
 * (which lets <GuestOnly> navigate). The status changes last so the redirect never runs
 * before the landing page is known.
 */
async function completeSignIn(auth: AuthResponse): Promise<UserPublic> {
  useSessionStore.getState().setAuth(auth)
  const landingPath = await landingPathFor(auth.user)
  useSessionStore.getState().signIn(auth, landingPath)
  return auth.user
}

/**
 * D07 (docs/COMPANIES.md, "Encaminhamento no frontend"): for COMPANY accounts read
 * GET /companies/me; an incomplete profile goes to onboarding. If the check fails the
 * user still signs in and lands on the dashboard, which shows the profile state itself.
 */
async function landingPathFor(user: UserPublic): Promise<string | null> {
  if (user.role !== 'COMPANY') return null
  try {
    const company = await companiesApi.getMe()
    return company.profile_completed ? null : paths.companyOnboarding
  } catch {
    return null
  }
}

/**
 * Ends the session on the backend (revokes the refresh token family) and clears memory.
 * Local state is cleared even if the request fails. The caller navigates to /entrar.
 */
export async function logout(): Promise<void> {
  try {
    // Same lock as refresh: a refresh in another tab must not rotate the cookie mid-logout.
    await withRefreshLock(async () => {
      const memoryCsrf = useSessionStore.getState().csrfToken
      try {
        await authApi.logout(memoryCsrf ?? (await fetchCsrfToken()))
      } catch (error) {
        // A stale in-memory CSRF token (cookie rotated by another tab) gets a 403 and the
        // backend keeps the session alive; retry once with a fresh token so it is revoked.
        if (memoryCsrf && isApiError(error) && error.status === 403) {
          await authApi.logout(await fetchCsrfToken())
          return
        }
        throw error
      }
    })
  } catch {
    // Session is cleared locally regardless; the cookie expires on its own.
  } finally {
    useSessionStore.getState().clear('logout')
  }
}
