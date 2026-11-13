import { env } from '@/config/env'
import { apiErrorFromResponse, networkError } from '@/shared/api/errors'

/**
 * Centralised HTTP client (CLAUDE.md §8). Components and pages never call fetch directly.
 *
 * - Prefixes the API base URL, sends/accepts JSON, always uses `credentials: 'include'`.
 * - Adds `Authorization: Bearer <token>` from the in-memory session.
 * - On 401, performs ONE refresh shared by all concurrent requests (single-flight),
 *   then retries the original request once. Refresh requests never trigger a refresh.
 * - Converts failed responses into a typed `ApiError`.
 *
 * Session concerns (where the token lives, how to refresh, what to do when the session
 * ends) are injected through `configure()`, so this module does not depend on `modules/`.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, QueryValue>
  headers?: Record<string, string>
  signal?: AbortSignal
  /** Attach the bearer token. Default: true. */
  auth?: boolean
  /** On 401, refresh the session and retry once. Default: same as `auth`. */
  retryOnUnauthorized?: boolean
  /** Sends `X-CSRF-Token` (refresh, logout and other cookie-authenticated calls). */
  csrfToken?: string | null
}

export interface SessionAdapter {
  getAccessToken: () => string | null
  /**
   * Renews the session and returns the new access token, or `null` when the session
   * can no longer be renewed. Network failures should be thrown, not mapped to null.
   */
  refreshAccessToken: () => Promise<string | null>
  /** Called when a refresh fails for a request that needed authentication. */
  onSessionExpired: () => void
}

export interface HttpClientOptions {
  baseUrl: string
  fetchFn?: typeof fetch
}

const noSession: SessionAdapter = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  onSessionExpired: () => {},
}

export function createHttpClient({ baseUrl, fetchFn }: HttpClientOptions) {
  const doFetch: typeof fetch = fetchFn ?? ((input, init) => globalThis.fetch(input, init))
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  let session: SessionAdapter = noSession
  let refreshInFlight: Promise<string | null> | null = null

  function buildUrl(path: string, query?: Record<string, QueryValue>): string {
    const url = `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`
    if (!query) return url
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params.append(key, String(value))
    }
    const search = params.toString()
    return search ? `${url}?${search}` : url
  }

  async function send(path: string, options: RequestOptions, token: string | null) {
    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers }
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`
    if (options.csrfToken) headers['X-CSRF-Token'] = options.csrfToken

    try {
      return await doFetch(buildUrl(path, options.query), {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'include',
        signal: options.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      if (import.meta.env.DEV && typeof location !== 'undefined') {
        // A CORS rejection looks like a network failure to the page; say what to check.
        console.warn(
          `[http-client] ${path} falhou sem resposta. Confirma que o backend está a correr em ` +
            `${normalizedBase} e que ${location.origin} está em CORS_ORIGINS.`,
        )
      }
      throw networkError(error)
    }
  }

  /** Single-flight: concurrent callers share the same refresh promise. */
  function refreshSession(): Promise<string | null> {
    if (!refreshInFlight) {
      refreshInFlight = session.refreshAccessToken().finally(() => {
        refreshInFlight = null
      })
    }
    return refreshInFlight
  }

  async function parseBody<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T
    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const auth = options.auth ?? true
    const retryOnUnauthorized = options.retryOnUnauthorized ?? auth
    const tokenUsed = auth ? session.getAccessToken() : null

    let response = await send(path, options, tokenUsed)

    if (response.status === 401 && retryOnUnauthorized) {
      // If another request already refreshed while this one was in flight, reuse that token.
      const current = session.getAccessToken()
      const nextToken = current && current !== tokenUsed ? current : await refreshSession()

      if (!nextToken) {
        session.onSessionExpired()
        throw await apiErrorFromResponse(response)
      }

      response = await send(path, options, nextToken)
      if (response.status === 401) {
        session.onSessionExpired()
        throw await apiErrorFromResponse(response)
      }
    }

    if (!response.ok) throw await apiErrorFromResponse(response)
    return parseBody<T>(response)
  }

  return {
    request,
    refreshSession,
    configure(adapter: SessionAdapter) {
      session = adapter
    },
    get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>

/** App-wide instance. Session wiring happens in `app/providers/http-session.ts`. */
export const httpClient = createHttpClient({ baseUrl: env.apiBaseUrl })
