import type { LucideIcon } from 'lucide-react'
import { ChevronsUpDown, Loader2, LogOut, UserCog } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { Logo } from '@/shared/components/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'

export interface SidebarNavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Match the path exactly (for home pages whose path prefixes other routes). */
  end?: boolean
}

export interface SidebarAccount {
  /** Main line of the profile block. */
  name: string
  /** Secondary line (e.g. the role). */
  detail?: string
}

interface SidebarProps {
  homeTo: string
  items: readonly SidebarNavItem[]
  account: SidebarAccount
  accountTo: string
  onLogout: () => void
  loggingOut?: boolean
  /** Called after a navigation link is followed (closes the mobile drawer). */
  onNavigate?: () => void
  className?: string
}

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none'

/**
 * Sidebar from wireframe 1 (CLAUDE.md §4.1): logo at the top, navigation in the middle,
 * profile block with "Conta" and "Terminar sessão" at the bottom.
 * Purely presentational; the role-specific items come from the layout.
 */
export function Sidebar({
  homeTo,
  items,
  account,
  accountTo,
  onLogout,
  loggingOut = false,
  onNavigate,
  className,
}: SidebarProps) {
  const initial = account.name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo to={homeTo} />
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    focusRing,
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={loggingOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-background disabled:opacity-60 data-[state=open]:bg-background',
              focusRing,
            )}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-card"
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {account.name}
              </span>
              {account.detail ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {account.detail}
                </span>
              ) : null}
            </span>
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span className="sr-only">
              {loggingOut ? 'A terminar sessão…' : 'Abrir menu da conta'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {account.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={accountTo} onClick={onNavigate}>
                <UserCog aria-hidden="true" /> Conta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled={loggingOut} onSelect={onLogout}>
              <LogOut aria-hidden="true" /> Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
