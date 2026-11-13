import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

export interface DetailItem {
  label: string
  /** null renders as "Por preencher". */
  value: ReactNode | null
  /** Spans both columns (long text such as a description). */
  wide?: boolean
}

/** Label/value grid for profile summaries. */
export function DetailList({ items }: { items: readonly DetailItem[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm sm:grid-cols-2">
      {items.map(({ label, value, wide }) => (
        <div key={label} className={cn('space-y-1 bg-card p-5', wide && 'sm:col-span-2')}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
          <dd
            className={
              value ? 'text-sm font-medium break-words whitespace-pre-line' : 'text-sm text-muted-foreground italic'
            }
          >
            {value ?? 'Por preencher'}
          </dd>
        </div>
      ))}
    </dl>
  )
}
