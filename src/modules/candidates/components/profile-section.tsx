import type { ReactNode } from 'react'

import { SaveStatus } from '@/shared/components/save-status'

interface ProfileSectionProps {
  id: string
  title: string
  description?: string
  /** Section actions (e.g. "Adicionar"). */
  actions?: ReactNode
  /** "Guardado" message after a successful change. */
  status?: string | null
  children: ReactNode
}

/** One block of the candidate profile page (CLAUDE.md §5.2: "secções editáveis"). */
export function ProfileSection({ id, title, description, actions, status = null, children }: ProfileSectionProps) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 id={`${id}-heading`} className="text-lg font-semibold">
              {title}
            </h2>
            <SaveStatus message={status} />
          </div>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
