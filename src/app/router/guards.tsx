import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'

import { homePathFor, loginPathWithNext, paths, safeNextPath } from '@/app/router/paths'
import { useSessionStore } from '@/modules/auth/store'
import type { UserRole } from '@/modules/auth/types'

/**
 * Route guards. They improve navigation only; the backend always enforces authorisation.
 * Both expect to render under <SessionBootstrap>, so the session is already resolved.
 */

export function RequireAuth() {
  const status = useSessionStore((state) => state.status)
  const endReason = useSessionStore((state) => state.endReason)
  const location = useLocation()

  if (status === 'authenticated') return <Outlet />

  if (endReason === 'logout') return <Navigate to={paths.login} replace />

  const target = `${location.pathname}${location.search}${location.hash}`
  return <Navigate to={loginPathWithNext(target)} replace />
}

interface RequireRoleProps {
  allow: readonly UserRole[]
}

/** Use inside <RequireAuth>. A user with another role is sent to their own home page. */
export function RequireRole({ allow }: RequireRoleProps) {
  const user = useSessionStore((state) => state.user)

  if (!user) return <Navigate to={paths.login} replace />
  if (!allow.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />

  return <Outlet />
}

/**
 * For public pages (/entrar, /registar). A signed-in user is sent to the landing page
 * decided at sign-in (company onboarding, D07), else a safe `?next=`, else their home page. This is also what moves the user on after a successful login.
 */
export function GuestOnly() {
  const user = useSessionStore((state) => state.user)
  const status = useSessionStore((state) => state.status)
  const landingPath = useSessionStore((state) => state.landingPath)
  const [searchParams] = useSearchParams()

  if (status === 'authenticated' && user) {
    const next = safeNextPath(searchParams.get('next'))
    return <Navigate to={landingPath ?? next ?? homePathFor(user.role)} replace />
  }

  return <Outlet />
}

/** `/`: home page of the signed-in user's role, or the login page. */
export function RootRedirect() {
  const user = useSessionStore((state) => state.user)
  const status = useSessionStore((state) => state.status)

  if (status === 'authenticated' && user) return <Navigate to={homePathFor(user.role)} replace />
  return <Navigate to={paths.login} replace />
}
