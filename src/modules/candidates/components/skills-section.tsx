import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, type UseFormRegister, type FieldErrors } from 'react-hook-form'

import { candidatesApi } from '@/modules/candidates/api'
import { FormActions } from '@/modules/candidates/components/form-actions'
import { ProfileSection } from '@/modules/candidates/components/profile-section'
import { RecordFormDialog } from '@/modules/candidates/components/record-form-dialog'
import {
  proficiencyLabels,
  proficiencyValues,
  skillDetailsDefaults,
  skillDetailsPayload,
  skillDetailsSchema,
  type SkillDetailsFormValues,
} from '@/modules/candidates/schemas'
import type { CandidateSkill } from '@/modules/candidates/types'
import { skillsApi, type Skill } from '@/modules/skills/api'
import { isApiError } from '@/shared/api/errors'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/error-state'
import { FormAlert } from '@/shared/components/form-alert'
import { FormField } from '@/shared/components/form-field'
import { LoadingState } from '@/shared/components/loading-state'
import { useSaveStatus } from '@/shared/hooks/use-save-status'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { NativeSelect } from '@/shared/components/ui/native-select'
import { useApiResource } from '@/shared/hooks/use-api-resource'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { cn } from '@/shared/utils/cn'
import { applyServerErrors } from '@/shared/utils/form-errors'

const byName = (a: CandidateSkill, b: CandidateSkill) => a.skill.name.localeCompare(b.skill.name, 'pt')

function yearsLabel(years: number | null | undefined): string | null {
  if (years == null) return null
  const text = Number.isInteger(years) ? String(years) : years.toLocaleString('pt-PT')
  return years === 1 ? '1 ano' : `${text} anos`
}

export function SkillsSection({ onChanged }: { onChanged: () => void }) {
  const { state, reload, setData } = useApiResource((signal) => candidatesApi.listSkills(signal))
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<CandidateSkill | null>(null)
  const [removing, setRemoving] = useState<CandidateSkill | null>(null)
  const status = useSaveStatus()
  const skills = state.status === 'success' ? [...state.data].sort(byName) : []

  function upsert(saved: CandidateSkill) {
    setData([...skills.filter((item) => item.skill.id !== saved.skill.id), saved])
    status.show()
    onChanged()
  }

  return (
    <ProfileSection
      id="skills"
      title="Competências"
      description="Competências do catálogo iKnow, com o teu nível e anos de experiência."
      status={status.message}
      actions={
        skills.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" /> Adicionar competência
          </Button>
        ) : null
      }
    >
      {state.status === 'loading' ? <LoadingState variant="list" count={2} label="A carregar competências…" /> : null}
      {state.status === 'error' ? (
        <div className="rounded-xl border border-border bg-card">
          <ErrorState error={state.error} onRetry={reload} />
        </div>
      ) : null}
      {state.status === 'success' && skills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Ainda não adicionaste competências"
          description="As competências são usadas para te recomendar oportunidades."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" /> Adicionar competência
            </Button>
          }
        />
      ) : null}

      {skills.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {skills.map((item) => (
            <li key={item.skill.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.skill.name}</p>
                {item.skill.category ? <p className="text-xs text-muted-foreground">{item.skill.category}</p> : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
                {item.proficiency ? (
                  <Badge variant="secondary">{proficiencyLabels[item.proficiency]}</Badge>
                ) : (
                  <span className="text-muted-foreground italic">Nível por indicar</span>
                )}
                {yearsLabel(item.years_experience) ? (
                  <span className="text-muted-foreground">{yearsLabel(item.years_experience)}</span>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(item)}
                  aria-label={`Editar ${item.skill.name}`}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setRemoving(item)}
                  aria-label={`Remover ${item.skill.name}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <RecordFormDialog
        open={adding}
        onOpenChange={setAdding}
        title="Adicionar competência"
        description="Pesquisa no catálogo e indica, se quiseres, o teu nível e anos de experiência."
      >
        <AddSkillForm
          addedIds={new Set(skills.map((item) => item.skill.id))}
          onCancel={() => setAdding(false)}
          onSaved={(saved) => {
            upsert(saved)
            setAdding(false)
          }}
        />
      </RecordFormDialog>

      <RecordFormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        title={editing ? `Editar ${editing.skill.name}` : 'Editar competência'}
        description="Nível e anos de experiência são opcionais."
      >
        {editing ? (
          <EditSkillForm
            item={editing}
            onCancel={() => setEditing(null)}
            onSaved={(saved) => {
              upsert(saved)
              setEditing(null)
            }}
          />
        ) : null}
      </RecordFormDialog>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remover competência?"
        description={removing ? `"${removing.skill.name}" vai ser removida do teu perfil.` : ''}
        confirmLabel="Remover"
        onConfirm={async () => {
          if (!removing) return
          await candidatesApi.removeSkill(removing.skill.id)
          setData(skills.filter((item) => item.skill.id !== removing.skill.id))
          status.show('Removida.')
        }}
      />
    </ProfileSection>
  )
}

/** Proficiency select and years input, shared by the add and edit forms. */
function SkillDetailsFields({
  register,
  errors,
  disabled,
}: {
  register: UseFormRegister<SkillDetailsFormValues>
  errors: FieldErrors<SkillDetailsFormValues>
  disabled: boolean
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Nível" error={errors.proficiency?.message}>
        {(c) => (
          <NativeSelect {...c} {...register('proficiency')} disabled={disabled}>
            <option value="">Por indicar</option>
            {proficiencyValues.map((value) => (
              <option key={value} value={value}>
                {proficiencyLabels[value]}
              </option>
            ))}
          </NativeSelect>
        )}
      </FormField>
      <FormField label="Anos de experiência" error={errors.years_experience?.message}>
        {(c) => <Input {...c} {...register('years_experience')} inputMode="decimal" disabled={disabled} />}
      </FormField>
    </div>
  )
}

function skillErrorMessage(error: unknown): string | null {
  if (!isApiError(error) || error.kind !== 'http') return null
  if (error.status === 409) return 'Esta competência já está no teu perfil.'
  if (error.status === 404) return 'Esta competência já não existe no catálogo.'
  return null
}

function AddSkillForm({
  addedIds,
  onCancel,
  onSaved,
}: {
  addedIds: Set<string>
  onCancel: () => void
  onSaved: (skill: CandidateSkill) => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Skill | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const search = useSkillSearch(debouncedQuery)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SkillDetailsFormValues>({
    resolver: zodResolver(skillDetailsSchema),
    defaultValues: skillDetailsDefaults(null),
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    if (!selected) {
      setSelectionError('Escolhe uma competência.')
      return
    }
    try {
      onSaved(await candidatesApi.addSkill({ skill_id: selected.id, ...skillDetailsPayload(values) }))
    } catch (error) {
      setFormError(skillErrorMessage(error) ?? applyServerErrors(error, setError, ['proficiency', 'years_experience']))
    }
  })

  const results = search.status === 'success' ? search.items.filter((skill) => !addedIds.has(skill.id)) : []

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormAlert message={formError} />

      <FormField label="Pesquisar competência" error={selectionError ?? undefined}>
        {(c) => (
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              {...c}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: nome da competência"
              className="pl-9"
              autoComplete="off"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
        )}
      </FormField>

      <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
        {search.status === 'loading' ? <LoadingState label="A pesquisar…" className="py-6" /> : null}
        {search.status === 'error' ? (
          <p role="alert" className="p-4 text-sm text-destructive">
            {isApiError(search.error) ? search.error.message : 'Não foi possível pesquisar.'}
          </p>
        ) : null}
        {search.status === 'success' && results.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {search.items.length > 0
              ? 'As competências encontradas já estão no teu perfil.'
              : 'Nenhuma competência encontrada.'}
          </p>
        ) : null}
        {results.length > 0 ? (
          <fieldset disabled={isSubmitting}>
            <legend className="sr-only">Resultados da pesquisa</legend>
            {results.map((skill) => (
              <label
                key={skill.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0 hover:bg-background has-[:focus-visible]:bg-background',
                  selected?.id === skill.id && 'bg-primary/10',
                )}
              >
                <input
                  type="radio"
                  name="skill"
                  value={skill.id}
                  checked={selected?.id === skill.id}
                  onChange={() => {
                    setSelected(skill)
                    setSelectionError(null)
                  }}
                  className="accent-primary"
                />
                <span className="flex-1 font-medium">{skill.name}</span>
                {skill.category ? <span className="text-xs text-muted-foreground">{skill.category}</span> : null}
              </label>
            ))}
          </fieldset>
        ) : null}
      </div>
      {search.status === 'success' && search.hasMore ? (
        <p className="text-xs text-muted-foreground">Mostram-se os primeiros resultados. Refina a pesquisa.</p>
      ) : null}

      <SkillDetailsFields register={register} errors={errors} disabled={isSubmitting} />
      <FormActions submitting={isSubmitting} onCancel={onCancel} />
    </form>
  )
}

const SEARCH_PAGE_SIZE = 20

type SkillSearchState =
  | { status: 'loading' }
  | { status: 'success'; items: Skill[]; hasMore: boolean }
  | { status: 'error'; error: unknown }

type SkillSearchResult =
  | { query: string; status: 'success'; items: Skill[]; hasMore: boolean }
  | { query: string; status: 'error'; error: unknown }

/** GET /skills?q= (partial, case-insensitive name search), first page sorted by name. */
function useSkillSearch(query: string): SkillSearchState {
  const [result, setResult] = useState<SkillSearchResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    skillsApi
      .list({ q: query || undefined, page: 1, page_size: SEARCH_PAGE_SIZE, sort_by: 'name' }, controller.signal)
      .then((response) =>
        setResult({
          query,
          status: 'success',
          items: response.items,
          hasMore: response.pagination.total_pages > 1,
        }),
      )
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ query, status: 'error', error })
      })
    return () => controller.abort()
  }, [query])

  // Results for an older query count as still loading.
  if (!result || result.query !== query) return { status: 'loading' }
  return result
}

function EditSkillForm({
  item,
  onCancel,
  onSaved,
}: {
  item: CandidateSkill
  onCancel: () => void
  onSaved: (skill: CandidateSkill) => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SkillDetailsFormValues>({
    resolver: zodResolver(skillDetailsSchema),
    defaultValues: skillDetailsDefaults(item),
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      onSaved(await candidatesApi.updateSkill(item.skill.id, skillDetailsPayload(values)))
    } catch (error) {
      setFormError(skillErrorMessage(error) ?? applyServerErrors(error, setError, ['proficiency', 'years_experience']))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <SkillDetailsFields register={register} errors={errors} disabled={isSubmitting} />
      <FormActions submitting={isSubmitting} onCancel={onCancel} />
    </form>
  )
}

