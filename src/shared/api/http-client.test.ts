import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/errors'
import { createHttpClient, type SessionAdapter } from '@/shared/api/http-client'

const BASE = 'http://api.test/api/v1'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/**
 * Fake backend: answers 401 unless the request carries `Bearer <validToken>`.
 * Records the Authorization header of every call.
 */
function fakeBackend(initialValidToken: string) {
  let validToken = initialValidToken
  const calls: { url: string; authorization: string | null }[] = []

  const fetchFn = vi.fn<typeof fetch>(async (input, init) => {
    const headers = new Headers(init?.headers)
    const authorization = headers.get('Authorization')
    calls.push({ url: String(input), authorization })
    if (authorization !== `Bearer ${validToken}`) {
      return json(401, { detail: 'Invalid or expired access token' })
    }
    return json(200, { url: String(input) })
  })

  return {
    fetchFn,
    calls,
    setValidToken: (token: string) => {
      validToken = token
    },
  }
}

/** Session adapter backed by a mutable token, with a controllable refresh. */
function fakeSession(initialToken: string | null) {
  let token = initialToken
  const adapter = {
    getAccessToken: vi.fn(() => token),
    refreshAccessToken: vi.fn<SessionAdapter['refreshAccessToken']>(),
    onSessionExpired: vi.fn(),
  }
  return {
    adapter,
    setToken: (next: string | null) => {
      token = next
    },
  }
}

describe('http-client — concurrent refresh (single-flight)', () => {
  it('runs ONE refresh for several concurrent 401s and retries each request once', async () => {
    const backend = fakeBackend('new-token')
    const session = fakeSession('expired-token')
    const refresh = deferred<string | null>()
    session.adapter.refreshAccessToken.mockImplementation(async () => {
      const next = await refresh.promise
      session.setToken(next)
      return next
    })

    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    const requests = Promise.all([
      client.get<{ url: string }>('/candidates/me'),
      client.get<{ url: string }>('/candidates/me/skills'),
      client.get<{ url: string }>('/users/me'),
    ])

    // Let all three requests receive and handle their 401 while the refresh is pending.
    await vi.waitFor(() => {
      expect(backend.calls).toHaveLength(3)
      expect(session.adapter.refreshAccessToken).toHaveBeenCalled()
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(session.adapter.refreshAccessToken).toHaveBeenCalledTimes(1)

    refresh.resolve('new-token')
    const results = await requests

    expect(session.adapter.refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(results.map((r) => r.url)).toEqual([
      `${BASE}/candidates/me`,
      `${BASE}/candidates/me/skills`,
      `${BASE}/users/me`,
    ])
    // 3 original attempts + 3 retries, retries all carry the refreshed token.
    expect(backend.calls).toHaveLength(6)
    expect(backend.calls.slice(3).every((c) => c.authorization === 'Bearer new-token')).toBe(true)
    expect(session.adapter.onSessionExpired).not.toHaveBeenCalled()
  })

  it('rejects every waiting request and signals expiry when the refresh fails', async () => {
    const backend = fakeBackend('never-valid')
    const session = fakeSession('expired-token')
    session.adapter.refreshAccessToken.mockResolvedValue(null)

    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    const results = await Promise.allSettled([
      client.get('/a'),
      client.get('/b'),
      client.get('/c'),
    ])

    expect(session.adapter.refreshAccessToken).toHaveBeenCalledTimes(1)
    for (const result of results) {
      expect(result.status).toBe('rejected')
      const reason = (result as PromiseRejectedResult).reason as ApiError
      expect(reason).toBeInstanceOf(ApiError)
      expect(reason.status).toBe(401)
    }
    expect(session.adapter.onSessionExpired).toHaveBeenCalled()
    // No retries were sent without a token.
    expect(backend.calls).toHaveLength(3)
  })

  it('reuses a token refreshed by another request instead of refreshing again', async () => {
    const backend = fakeBackend('expired-token')
    const session = fakeSession('expired-token')
    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    // Simulate: request leaves with the old token, and while it is in flight the
    // token is rotated elsewhere, so the backend now rejects the old one.
    backend.fetchFn.mockImplementationOnce(async () => {
      backend.setValidToken('rotated-token')
      session.setToken('rotated-token')
      return json(401, { detail: 'Invalid or expired access token' })
    })

    await expect(client.get('/users/me')).resolves.toEqual({ url: `${BASE}/users/me` })
    expect(session.adapter.refreshAccessToken).not.toHaveBeenCalled()
    expect(backend.calls.at(-1)?.authorization).toBe('Bearer rotated-token')
  })

  it('starts a new refresh for a later wave of 401s after the previous one settled', async () => {
    const backend = fakeBackend('token-1')
    const session = fakeSession('token-0')
    let counter = 0
    session.adapter.refreshAccessToken.mockImplementation(async () => {
      counter += 1
      const next = `token-${counter}`
      session.setToken(next)
      return next
    })

    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    await client.get('/first')
    backend.setValidToken('token-2')
    await client.get('/second')

    expect(session.adapter.refreshAccessToken).toHaveBeenCalledTimes(2)
  })

  it('signals expiry when the retried request is still unauthorised', async () => {
    const backend = fakeBackend('never-valid')
    const session = fakeSession('expired-token')
    session.adapter.refreshAccessToken.mockImplementation(async () => {
      session.setToken('refreshed-but-rejected')
      return 'refreshed-but-rejected'
    })

    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    await expect(client.get('/users/me')).rejects.toMatchObject({ status: 401 })
    expect(backend.calls).toHaveLength(2)
    expect(session.adapter.onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('propagates a network failure during refresh without ending the session', async () => {
    const backend = fakeBackend('new-token')
    const session = fakeSession('expired-token')
    session.adapter.refreshAccessToken.mockRejectedValue(
      new ApiError({ kind: 'network', status: 0, message: 'offline' }),
    )

    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    await expect(client.get('/users/me')).rejects.toMatchObject({ kind: 'network' })
    expect(session.adapter.onSessionExpired).not.toHaveBeenCalled()
  })

  it('never refreshes for requests that opt out (e.g. the refresh call itself)', async () => {
    const backend = fakeBackend('irrelevant')
    const session = fakeSession(null)
    const client = createHttpClient({ baseUrl: BASE, fetchFn: backend.fetchFn })
    client.configure(session.adapter)

    await expect(
      client.post('/auth/refresh', undefined, {
        auth: false,
        retryOnUnauthorized: false,
        csrfToken: 'csrf-1',
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(session.adapter.refreshAccessToken).not.toHaveBeenCalled()
    expect(session.adapter.onSessionExpired).not.toHaveBeenCalled()
  })
})

describe('http-client — request shape', () => {
  it('sends credentials, JSON body, bearer and CSRF headers, and skips empty query values', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }))
    const session = fakeSession('token-x')
    const client = createHttpClient({ baseUrl: `${BASE}/`, fetchFn })
    client.configure(session.adapter)

    const result = await client.post(
      '/things',
      { name: 'Ana' },
      { query: { page: 2, q: undefined, active: true }, csrfToken: 'csrf-9' },
    )

    expect(result).toBeUndefined()
    const [url, init] = fetchFn.mock.calls[0]!
    expect(url).toBe(`${BASE}/things?page=2&active=true`)
    expect(init?.credentials).toBe('include')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ name: 'Ana' }))
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBe('Bearer token-x')
    expect(headers.get('X-CSRF-Token')).toBe('csrf-9')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('converts fetch failures into network ApiErrors', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch')
    })
    const client = createHttpClient({ baseUrl: BASE, fetchFn })

    await expect(client.get('/health', { auth: false })).rejects.toMatchObject({
      kind: 'network',
      status: 0,
    })
  })
})
