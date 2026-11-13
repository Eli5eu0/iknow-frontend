import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

import { navigationFor, roleLabels } from '@/app/layouts/navigation'
import { homePathFor, paths } from '@/app/router/paths'
import { logout } from '@/modules/auth/session'
import { useSessionStore } from '@/modules/auth/store'
import { Logo } from '@/shared/components/logo'
import { Sidebar } from '@/shared/components/sidebar'
import { Button } from '@/shared/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet'

/**
 * Authenticated shell (CLAUDE.md §4.1, wireframe 1): fixed 256px sidebar on desktop,
 * drawer behind a menu button below 1024px (guia visual §12.2). Use inside <RequireAuth>.
 */
export function AppLayout() {
  const user = useSessionStore((state) => state.user)
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return <Navigate to={paths.login} replace />

  async function handleLogout() {
    setLoggingOut(true)
    setDrawerOpen(false)
    await logout()
    navigate(paths.login, { replace: true })
  }

  const homeTo = homePathFor(user.role)
  // GET /auth/me has no display name (UserPublic: id, email, role, is_active).
  const sidebar = (onNavigate?: () => void) => (
    <Sidebar
      homeTo={homeTo}
      items={navigationFor(user.role)}
      account={{ name: user.email, detail: roleLabels[user.role] }}
      accountTo={paths.account}
      onLogout={() => void handleLogout()}
      loggingOut={loggingOut}
      onNavigate={onNavigate}
    />
  )

  return (
    <div className="min-h-screen bg-background lg:flex">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-card px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:ring-2 focus:ring-ring"
      >
        Saltar para o conteúdo
      </a>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border lg:block">
        {sidebar()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 gap-0 bg-card p-0" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              {sidebar(() => setDrawerOpen(false))}
            </SheetContent>
          </Sheet>
          <Logo to={homeTo} />
        </header>

        <main id="conteudo" tabIndex={-1} className="flex-1 px-6 py-8 outline-none lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
