import { httpClient } from '@/shared/api/http-client'
import type {
  AuthResponse,
  CsrfResponse,
  LoginRequest,
  RegisterRequest,
  UserPublic,
} from '@/modules/auth/types'

/**
 * Auth endpoints (OpenAPI: /api/v1/auth/*). Endpoints that rely on the refresh cookie
 * never attach the bearer token and never trigger the 401 refresh flow.
 */
export const authApi = {
  // Login and register need no CSRF token (the backend checks Origin); a 401 here means
  // wrong credentials, never an expired session, so they must not trigger a refresh.
  login: (payload: LoginRequest) =>
    httpClient.post<AuthResponse>('/auth/login', payload, {
      auth: false,
      retryOnUnauthorized: false,
    }),

  register: (payload: RegisterRequest) =>
    httpClient.post<AuthResponse>('/auth/register', payload, {
      auth: false,
      retryOnUnauthorized: false,
    }),

  getCsrf: () =>
    httpClient.get<CsrfResponse>('/auth/csrf', { auth: false, retryOnUnauthorized: false }),

  refresh: (csrfToken: string) =>
    httpClient.post<AuthResponse>('/auth/refresh', undefined, {
      auth: false,
      retryOnUnauthorized: false,
      csrfToken,
    }),

  logout: (csrfToken: string | null) =>
    httpClient.post<void>('/auth/logout', undefined, {
      auth: false,
      retryOnUnauthorized: false,
      csrfToken,
    }),

  me: () => httpClient.get<UserPublic>('/auth/me'),
}
