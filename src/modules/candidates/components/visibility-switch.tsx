import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { candidatesApi } from '@/modules/candidates/api'
import type { CandidateProfile } from '@/modules/candidates/types'
import { isApiError } from '@/shared/api/errors'
import { cn } from '@/shared/utils/cn'

interface VisibilitySwitchProps {
  /** Profiles are public by default (docs/CANDIDATES.md), also before they exist. */
  isPublic: boolean
  onSaved: (profile: CandidateProfile) => void
}

/** PATCH /candidates/me/visibility. A private profile answers 404 on the public endpoint. */
export function VisibilitySwitch({ isPublic, onSaved }: VisibilitySwitchProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setPending(true)
    setError(null)
    try {
      onSaved(await candidatesApi.setVisibility(!isPublic))
    } catch (caught) {
      setError(isApiError(caught) ? caught.message : 'Não foi possível alterar a visibilidade.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        onClick={() => void toggle()}
        disabled={pending}
        className="inline-flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : isPublic ? (
          <Eye className="size-4" aria-hidden="true" />
        ) : (
          <EyeOff className="size-4" aria-hidden="true" />
        )}
        Perfil público
        <span
          aria-hidden="true"
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors',
            isPublic ? 'bg-primary' : 'bg-border',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-4 rounded-full bg-card shadow-sm transition-transform',
              isPublic ? 'translate-x-4.5' : 'translate-x-0.5',
            )}
          />
        </span>
      </button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isPublic ? 'O teu perfil público está visível.' : 'O teu perfil público está oculto.'}
        </p>
      )}
    </div>
  )
}
