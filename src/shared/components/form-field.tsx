import { type ReactNode, useId } from 'react'

import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/utils/cn'

export interface FieldControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  label: string
  /** Error shown next to the field (CLAUDE.md §9). */
  error?: string
  hint?: ReactNode
  className?: string
  /** Receives the props that link the control to its label, hint and error. */
  children: (control: FieldControlProps) => ReactNode
}

export function FormField({ label, error, hint, className, children }: FormFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
