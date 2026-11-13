import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiErrorFromBody } from '@/shared/api/errors'
import { authApi } from '@/modules/auth/api'
import { login, logout, register } from '@/modules/auth/session'
import { useSessionStore } from '@/modules/auth/store'
import { companiesApi } from '@/modules/companies/api'
import type { Company } from '@/modules/companies/types'
import type { AuthResponse } from '@/modules/auth/types'

vi.mock('@/modules/companies/api', () => ({
  companiesApi: { getMe: vi.fn() },
}))

vi.mock('@/modules/auth/api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), getCsrf: vi.fn() },
}))

const auth: AuthResponse = {
  access_token: 'access-1',
  token_type: 'bearer',
  expires_in: 900,
  csrf_token: 'csrf-1',
  user: { id: '00000000-0000-4000-8000-000000000001', email: 'ana@example.com', role: 'COMPANY', is_active: true },
}

beforeEach(() => {
  useSessionStore.getState().clear('logout')
})

describe('login / register', () => {
  it('stores the session in memory and marks it authenticated', async () => {
    vi.mocked(authApi.login).mockResolvedValue(auth)

    const user = await login({ email: 'ana@example.com', password: 'secret' })

    expect(user.role).toBe('COMPANY')
    const state = useSessionStore.getState()
    expect(state).toMatchObject({
      status: 'authenticated',
      accessToken: 'access-1',
      csrfToken: 'csrf-1',
      endReason: null,
    })
    expect(state.user?.email).toBe('ana@example.com')
  })

  it('leaves the session untouched and rethrows when login fails', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      apiErrorFromBody(401, { detail: 'Invalid email or password' }),
    )

    await expect(login({ email: 'ana@example.com', password: 'wrong' })).rejects.toMatchObject({
      status: 401,
    })
    expect(useSessionStore.getState()).toMatchObject({
      status: 'unauthenticated',
      accessToken: null,
      user: null,
    })
  })

  it('signs the new user in after registration', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ ...auth, user: { ...auth.user, role: 'CANDIDATE' } })

    await register({ email: 'ana@example.com', password: 'a'.repeat(12), role: 'CANDIDATE' })

    expect(authApi.register).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'a'.repeat(12),
      role: 'CANDIDATE',
    })
    expect(useSessionStore.getState().status).toBe('authenticated')
    expect(useSessionStore.getState().user?.role).toBe('CANDIDATE')
  })
})

describe('logout', () => {
  it('retries once with a fresh CSRF token when the in-memory one is stale (403)', async () => {
    useSessionStore.getState().signIn(auth)
    vi.mocked(authApi.logout)
      .mockRejectedValueOnce(apiErrorFromBody(403, { detail: 'Invalid CSRF token' }))
      .mockResolvedValueOnce(undefined)
    vi.mocked(authApi.getCsrf).mockResolvedValue({ csrf_token: 'csrf-fresh' })

    await logout()

    expect(vi.mocked(authApi.logout).mock.calls).toEqual([['csrf-1'], ['csrf-fresh']])
    expect(useSessionStore.getState()).toMatchObject({
      status: 'unauthenticated',
      accessToken: null,
      endReason: 'logout',
    })
  })

  it('clears the local session even when the backend cannot be reached', async () => {
    useSessionStore.getState().signIn(auth)
    vi.mocked(authApi.logout).mockRejectedValue(new Error('offline'))

    await logout()

    expect(authApi.logout).toHaveBeenCalledTimes(1)
    expect(useSessionStore.getState()).toMatchObject({ user: null, endReason: 'logout' })
  })
})

describe('landing page after sign-in (D07)', () => {
  const companyAuth: AuthResponse = { ...auth, user: { ...auth.user, role: 'COMPANY' } }
  const company = (profile_completed: boolean) =>
    ({ profile_completed, missing_fields: profile_completed ? [] : ['name'] }) as unknown as Company

  it('sends a company with an incomplete profile to onboarding', async () => {
    vi.mocked(authApi.login).mockResolvedValue(companyAuth)
    vi.mocked(companiesApi.getMe).mockImplementation(async () => {
      // The token must already be in memory when GET /companies/me runs.
      expect(useSessionStore.getState().accessToken).toBe('access-1')
      // ...but the session is not "authenticated" yet, so <GuestOnly> has not redirected.
      expect(useSessionStore.getState().status).not.toBe('authenticated')
      return company(false)
    })

    await login({ email: 'ana@example.com', password: 'secret' })

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      landingPath: '/empresa/onboarding',
    })
  })

  it('uses the normal destination for a complete profile', async () => {
    vi.mocked(authApi.login).mockResolvedValue(companyAuth)
    vi.mocked(companiesApi.getMe).mockResolvedValue(company(true))

    await login({ email: 'ana@example.com', password: 'secret' })

    expect(useSessionStore.getState().landingPath).toBeNull()
  })

  it('still signs in when the company check fails', async () => {
    vi.mocked(authApi.register).mockResolvedValue(companyAuth)
    vi.mocked(companiesApi.getMe).mockRejectedValue(apiErrorFromBody(500, null))

    await register({ email: 'ana@example.com', password: 'a'.repeat(12), role: 'COMPANY' })

    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', landingPath: null })
  })

  it('does not call the companies API for candidates', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ ...auth, user: { ...auth.user, role: 'CANDIDATE' } })

    await login({ email: 'ana@example.com', password: 'secret' })

    expect(companiesApi.getMe).not.toHaveBeenCalled()
    expect(useSessionStore.getState().landingPath).toBeNull()
  })
})
