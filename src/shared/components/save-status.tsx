import { Check } from 'lucide-react'

/** Shows the message from `useSaveStatus` (shared/hooks/use-save-status.ts). */
export function SaveStatus({ message }: { message: string | null }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex min-h-5 items-center gap-1 text-sm text-success">
      {message ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          {message}
        </>
      ) : null}
    </span>
  )
}
