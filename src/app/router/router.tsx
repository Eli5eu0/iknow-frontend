import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { AppLayout } from '@/app/layouts/app-layout'
import { SessionBootstrap } from '@/app/providers/session-bootstrap'
import { GuestOnly, RequireAuth, RequireRole, RootRedirect } from '@/app/router/guards'
import { NotFoundPage } from '@/app/router/not-found-page'
import { paths } from '@/app/router/paths'
import { LoadingState } from '@/shared/components/loading-state'

// Development-only routes. Excluded from production builds.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/ui',
        lazy: async () => {
          const { UiShowcasePage } = await import('@/app/dev/ui-showcase-page')
          return { Component: UiShowcasePage }
        },
      },
      {
        path: 'dev/auth-layout',
        lazy: async () => {
          const { AuthLayoutShowcasePage } = await import('@/app/dev/auth-layout-showcase-page')
          return { Component: AuthLayoutShowcasePage }
        },
      },
      {
        // Real shell: needs a session; the sidebar follows the signed-in user's role.
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: 'dev/app-layout',
                lazy: async () => {
                  const { LayoutShowcasePage } = await import('@/app/dev/layout-showcase-page')
                  return { Component: LayoutShowcasePage }
                },
              },
            ],
          },
        ],
      },
    ]
  : []

// Public pages (split layout, no sidebar). Signed-in users are sent away by <GuestOnly>.
const publicRoutes: RouteObject[] = [
  {
    element: <GuestOnly />,
    children: [
      {
        path: paths.login.slice(1),
        lazy: async () => {
          const { LoginPage } = await import('@/modules/auth/pages/login-page')
          return { Component: LoginPage }
        },
      },
      {
        path: paths.register.slice(1),
        lazy: async () => {
          const { RegisterPage } = await import('@/modules/auth/pages/register-page')
          return { Component: RegisterPage }
        },
      },
    ],
  },
]

/*
 * Authenticated area: session required, then the role. Pages are added here as they are
 * built (CLAUDE.md §5). Not yet registered because the backend has no endpoints for them:
 * opportunities, applications, matching and notifications.
 */
const protectedRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        // Company onboarding uses the split layout, without the sidebar (§5.3).
        element: <RequireRole allow={['COMPANY']} />,
        children: [
          {
            path: paths.companyOnboarding.slice(1),
            lazy: async () => {
              const { CompanyOnboardingPage } = await import(
                '@/modules/companies/pages/company-onboarding-page'
              )
              return { Component: CompanyOnboardingPage }
            },
          },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          {
            element: <RequireRole allow={['COMPANY']} />,
            children: [
              {
                path: paths.companyHome.slice(1),
                lazy: async () => {
                  const { CompanyDashboardPage } = await import(
                    '@/modules/companies/pages/company-dashboard-page'
                  )
                  return { Component: CompanyDashboardPage }
                },
              },
            ],
          },
          {
            element: <RequireRole allow={['CANDIDATE']} />,
            children: [
              {
                path: paths.candidateHome.slice(1),
                lazy: async () => {
                  const { CandidateDashboardPage } = await import(
                    '@/modules/candidates/pages/candidate-dashboard-page'
                  )
                  return { Component: CandidateDashboardPage }
                },
              },
              {
                path: paths.candidateProfile.slice(1),
                lazy: async () => {
                  const { CandidateProfilePage } = await import(
                    '@/modules/candidates/pages/candidate-profile-page'
                  )
                  return { Component: CandidateProfilePage }
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
export const router = createBrowserRouter([
  {
    path: '/',
    element: <SessionBootstrap />,
    // Shown while a lazy route loads on the first render.
    hydrateFallbackElement: <LoadingState fullScreen />,
    children: [
      { index: true, element: <RootRedirect /> },
      ...publicRoutes,
      ...protectedRoutes,
      ...devRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
