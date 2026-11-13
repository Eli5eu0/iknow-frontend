import type { LucideIcon } from 'lucide-react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { ProfileSection } from '@/modules/candidates/components/profile-section'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/error-state'
import { LoadingState } from '@/shared/components/loading-state'
import { useSaveStatus } from '@/shared/hooks/use-save-status'
import { Button } from '@/shared/components/ui/button'
import { useApiResource } from '@/shared/hooks/use-api-resource'

export interface RecordView {
  title: string
  subtitle: string | null
  period: string
  description: string | null
}

export interface RecordFormProps<T> {
  /** null when adding. */
  record: T | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (record: T) => void
}

interface RecordListSectionProps<T extends { id: string }> {
  id: string
  title: string
  description: string
  addLabel: string
  emptyTitle: string
  emptyDescription: string
  emptyIcon: LucideIcon
  deleteTitle: string
  load: (signal: AbortSignal) => Promise<T[]>
  remove: (id: string) => Promise<void>
  view: (record: T) => RecordView
  /** Keeps the list in the backend's order (start date, newest first). */
  sort: (a: T, b: T) => number
  renderForm: (props: RecordFormProps<T>) => ReactNode
  /** A write may have created the profile (first write on the profile). */
  onChanged: () => void
}

/** List + add/edit dialog + delete confirmation, shared by experience and education. */
export function RecordListSection<T extends { id: string }>(props: RecordListSectionProps<T>) {
  const { state, reload, setData } = useApiResource(props.load)
  const [editing, setEditing] = useState<{ record: T | null } | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const status = useSaveStatus()
  const records = state.status === 'success' ? state.data : []

  function handleSaved(saved: T) {
    const others = records.filter((record) => record.id !== saved.id)
    setData([...others, saved].sort(props.sort))
    status.show()
    props.onChanged()
  }

  return (
    <ProfileSection
      id={props.id}
      title={props.title}
      description={props.description}
      status={status.message}
      actions={
        state.status === 'success' && records.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({ record: null })}>
            <Plus aria-hidden="true" /> {props.addLabel}
          </Button>
        ) : null
      }
    >
      {state.status === 'loading' ? <LoadingState variant="list" count={2} label="A carregar…" /> : null}

      {state.status === 'error' ? (
        <div className="rounded-xl border border-border bg-card">
          <ErrorState error={state.error} onRetry={reload} />
        </div>
      ) : null}

      {state.status === 'success' && records.length === 0 ? (
        <EmptyState
          icon={props.emptyIcon}
          title={props.emptyTitle}
          description={props.emptyDescription}
          action={
            <Button onClick={() => setEditing({ record: null })}>
              <Plus aria-hidden="true" /> {props.addLabel}
            </Button>
          }
        />
      ) : null}

      {records.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {records.map((record) => {
            const item = props.view(record)
            return (
              <li key={record.id} className="flex gap-4 p-5">
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.subtitle ? <p className="text-sm">{item.subtitle}</p> : null}
                  <p className="text-sm text-muted-foreground">{item.period}</p>
                  {item.description ? (
                    <p className="pt-1 text-sm whitespace-pre-line text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing({ record })}
                    aria-label={`Editar ${item.title}`}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(record)}
                    aria-label={`Eliminar ${item.title}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {props.renderForm({
        record: editing?.record ?? null,
        open: editing !== null,
        onOpenChange: (open) => {
          if (!open) setEditing(null)
        },
        onSaved: (saved) => {
          handleSaved(saved)
          setEditing(null)
        },
      })}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={props.deleteTitle}
        description={deleting ? `"${props.view(deleting).title}" vai ser eliminado do teu perfil.` : ''}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return
          await props.remove(deleting.id)
          setData(records.filter((record) => record.id !== deleting.id))
          status.show('Eliminado.')
        }}
      />
    </ProfileSection>
  )
}
