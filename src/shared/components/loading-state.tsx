import { Loader2 } from 'lucide-react'

import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/utils/cn'

/**
 * - `spinner`: short waits and the full-screen session start-up.
 * - `list`: skeleton rows (applications, notifications).
 * - `cards`: skeleton cards matching the card layout (image, avatar, two lines).
 */
export type LoadingVariant = 'spinner' | 'list' | 'cards'

interface LoadingStateProps {
  variant?: LoadingVariant
  /** Announced to screen readers; visible only for the spinner. */
  label?: string
  fullScreen?: boolean
  /** Number of skeleton items. */
  count?: number
  className?: string
}

export function LoadingState({
  variant = 'spinner',
  label = 'A carregar…',
  fullScreen = false,
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center justify-center gap-3 text-muted-foreground',
          fullScreen ? 'min-h-screen' : 'py-12',
          className,
        )}
      >
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>
    )
  }

  const items = Array.from({ length: count }, (_, index) => index)

  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {variant === 'list' ? (
        <ul className="space-y-3" aria-hidden="true">
          {items.map((index) => (
            <li
              key={index}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4"
          aria-hidden="true"
        >
          {items.map((index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <Skeleton className="aspect-[16/9] w-full rounded-lg" />
              <div className="mt-4 flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
