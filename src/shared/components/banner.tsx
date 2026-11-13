import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

interface BannerProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  /** Renders the title as the page's <h1> (dashboards have no separate PageHeader). */
  as?: 'h1' | 'h2'
  className?: string
}

/**
 * Wide yellow card at the top of a dashboard (CLAUDE.md §4.1): welcome text or a
 * contextual notice. The only place where yellow may fill a large area (§3).
 */
export function Banner({ title, description, action, as: Heading = 'h1', className }: BannerProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-primary px-8 py-8 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <Heading className="text-2xl font-semibold tracking-tight">{title}</Heading>
        {description ? <p className="max-w-2xl text-sm text-primary-foreground/80">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  )
}
