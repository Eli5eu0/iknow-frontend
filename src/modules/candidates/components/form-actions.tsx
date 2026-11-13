import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

/** Cancel + submit row for the profile dialogs. */
export function FormActions({ submitting, onCancel }: { submitting: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {submitting ? 'A guardar…' : 'Guardar'}
      </Button>
    </div>
  )
}
