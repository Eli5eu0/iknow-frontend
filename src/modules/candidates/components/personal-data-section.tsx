import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { candidatesApi } from '@/modules/candidates/api'
import { ProfileSection } from '@/modules/candidates/components/profile-section'
import { formatLocation } from '@/modules/candidates/profile-display'
import { profileDefaults, profilePayload, profileSchema, type ProfileFormValues } from '@/modules/candidates/schemas'
import type { CandidateProfile } from '@/modules/candidates/types'
import { DetailList } from '@/shared/components/detail-list'
import { EmptyState } from '@/shared/components/empty-state'
import { FormAlert } from '@/shared/components/form-alert'
import { FormField } from '@/shared/components/form-field'
import { useSaveStatus } from '@/shared/hooks/use-save-status'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { applyServerErrors } from '@/shared/utils/form-errors'

interface PersonalDataSectionProps {
  /** null while the candidate has no profile (GET /candidates/me → 404). */
  profile: CandidateProfile | null
  onSaved: (profile: CandidateProfile) => void
}

const fields = ['full_name', 'headline', 'phone', 'city', 'country', 'availability', 'summary'] as const

export function PersonalDataSection({ profile, onSaved }: PersonalDataSectionProps) {
  const [editing, setEditing] = useState(false)
  const status = useSaveStatus()

  return (
    <ProfileSection
      id="personal-data"
      title="Dados pessoais"
      status={status.message}
      actions={
        profile && !editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" /> Editar
          </Button>
        ) : null
      }
    >
      {editing ? (
        <PersonalDataForm
          profile={profile}
          onCancel={() => setEditing(false)}
          onSaved={(saved) => {
            onSaved(saved)
            setEditing(false)
            status.show()
          }}
        />
      ) : profile ? (
        <DetailList
          items={[
            { label: 'Nome', value: profile.full_name?.trim() || null },
            { label: 'Título profissional', value: profile.headline?.trim() || null },
            { label: 'Telefone', value: profile.phone?.trim() || null },
            { label: 'Localização', value: formatLocation(profile) },
            { label: 'Disponibilidade', value: profile.availability?.trim() || null, wide: true },
            { label: 'Resumo', value: profile.summary?.trim() || null, wide: true },
          ]}
        />
      ) : (
        <EmptyState
          icon={UserRound}
          title="Ainda não criaste o teu perfil"
          description="Começa pelos teus dados. Também podes adicionar competências, experiência e formação."
          action={<Button onClick={() => setEditing(true)}>Preencher dados</Button>}
        />
      )}
    </ProfileSection>
  )
}

function PersonalDataForm({
  profile,
  onCancel,
  onSaved,
}: {
  profile: CandidateProfile | null
  onCancel: () => void
  onSaved: (profile: CandidateProfile) => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaults(profile),
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      onSaved(await candidatesApi.putMe(profilePayload(values)))
    } catch (error) {
      setFormError(applyServerErrors(error, setError, fields))
    }
  })

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <FormAlert message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nome" error={errors.full_name?.message}>
          {(control) => <Input {...control} {...register('full_name')} autoComplete="name" disabled={isSubmitting} />}
        </FormField>
        <FormField label="Título profissional" error={errors.headline?.message}>
          {(control) => <Input {...control} {...register('headline')} disabled={isSubmitting} />}
        </FormField>
        <FormField label="Telefone" hint="Não aparece no perfil público." error={errors.phone?.message}>
          {(control) => (
            <Input {...control} {...register('phone')} type="tel" autoComplete="tel" disabled={isSubmitting} />
          )}
        </FormField>
        <FormField label="Disponibilidade" error={errors.availability?.message}>
          {(control) => <Input {...control} {...register('availability')} disabled={isSubmitting} />}
        </FormField>
        <FormField label="Cidade" error={errors.city?.message}>
          {(control) => (
            <Input {...control} {...register('city')} autoComplete="address-level2" disabled={isSubmitting} />
          )}
        </FormField>
        <FormField label="País" error={errors.country?.message}>
          {(control) => (
            <Input {...control} {...register('country')} autoComplete="country-name" disabled={isSubmitting} />
          )}
        </FormField>
      </div>
      <FormField label="Resumo" error={errors.summary?.message}>
        {(control) => <Textarea {...control} {...register('summary')} rows={5} disabled={isSubmitting} />}
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'A guardar…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
