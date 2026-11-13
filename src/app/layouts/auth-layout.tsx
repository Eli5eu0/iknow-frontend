import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

interface AuthLayoutProps {
  /** Short title over the image (bottom-left). */
  asideTitle: string
  /** Explanatory text under the title. */
  asideText: string
  /** The form card. Defaults to the nested route. */
  children?: ReactNode
}

/**
 * Split layout (CLAUDE.md §4.2, wireframe 2): 50/50, no sidebar, full screen.
 * Left: the form, vertically centred, max 420px. Right: image with text bottom-left.
 * Below 1024px the image column is hidden and the form takes the full width.
 *
 * The image is a neutral placeholder until final illustrations exist (open question 5).
 */
export function AuthLayout({ asideTitle, asideText, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">{children ?? <Outlet />}</div>
      </main>

      <aside className="relative hidden overflow-hidden bg-foreground lg:block">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.08)_1px,transparent_1px)] bg-[size:24px_24px]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <span className="mb-5 block h-1 w-12 rounded-full bg-primary" aria-hidden="true" />
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white">
            {asideTitle}
          </h2>
          <p className="mt-3 max-w-md text-base text-white/75">{asideText}</p>
        </div>
      </aside>
    </div>
  )
}
