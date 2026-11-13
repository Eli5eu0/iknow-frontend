import { zodResolver } from '@hookform/resolvers/zod'
import { Briefcase } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { candidatesApi } from '@/modules/candidates/api'
import { FormActions } from '@/modules/candidates/components/form-actions'
import { PeriodFields } from '@/modules/candidates/components/period-fields'
import { RecordFormDialog } from '@/modules/candidates/components/record-form-dialog'
import { RecordListSection, type RecordFormProps } from '@/modules/candidates/components/record-list-section'
import { formatPeriod, joinFilled } from '@/modules/candidates/profile-display'
import {
  experienceDefaults,
  experiencePayload,
  experienceSchema,
  type ExperienceFormValues,
} from '@/modules/candidates/schemas'
import type { Experience } from '@/modules/candidates/types'
import { FormAlert } from '@/shared/components/form-alert'
import { FormField } from '@/shared/components/form-field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { applyServerErrors } from '@/shared/utils/form-errors'

const fields = [
  'job_title',
  'company_name',
  'employment_type',
  'city',
  'country',
  'description',
  'start_date',
  'end_date',
  'is_current',
] as const

/** Newest first, like GET /candidates/me/experiences (order by start_date desc). */
const byStartDesc = (a: { start_date: string }, b: { start_date: string }) => b.start_date.localeCompare(a.start_date)

export function ExperienceSection({ onChanged }: { onChanged: () => void }) {
  return (
    <RecordListSection<Experience>
      id="experience"
      title="Experiência profissional"
      description="Opcional. Funções que desempenhaste, da mais recente para a mais antiga."
      addLabel="Adicionar experiência"
      emptyIcon={Briefcase}
      emptyTitle="Ainda não adicionaste experiência"
      emptyDescription="A experiência profissional é opcional, mas ajuda as empresas a conhecer o teu percurso."
      deleteTitle="Eliminar experiência?"
      load={(signal) => candidatesApi.listExperiences(signal)}
      remove={(id) => candidatesApi.deleteExperience(id)}
      sort={byStartDesc}
      onChanged={onChanged}
      view={(record) => ({
        title: record.job_title,
        subtitle: joinFilled([record.company_name, record.employment_type, joinFilled([record.city, record.country])]),
        period: formatPeriod(record.start_date, record.end_date, record.is_current),
        description: record.description ?? null,
      })}
      renderForm={(props) => <ExperienceDialog {...props} />}
    />
  )
}

function ExperienceDialog({ record, open, onOpenChange, onSaved }: RecordFormProps<Experience>) {
  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Editar experiência' : 'Adicionar experiência'}
      description="Os campos marcados com * são obrigatórios."
    >
      <ExperienceForm record={record} onCancel={() => onOpenChange(false)} onSaved={onSaved} />
    </RecordFormDialog>
  )
}

function ExperienceForm({
  record,
  onCancel,
  onSaved,
}: {
  record: Experience | null
  onCancel: () => void
  onSaved: (record: Experience) => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experienceDefaults(record),
  })
  const isCurrent = useWatch({ control, name: 'is_current' })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const payload = experiencePayload(values)
      onSaved(
        record
          ? await candidatesApi.updateExperience(record.id, payload)
          : await candidatesApi.createExperience(payload),
      )
    } catch (error) {
      setFormError(applyServerErrors(error, setError, fields))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Função *" error={errors.job_title?.message}>
          {(c) => <Input {...c} {...register('job_title')} autoComplete="organization-title" disabled={isSubmitting} />}
        </FormField>
        <FormField label="Empresa *" error={errors.company_name?.message}>
          {(c) => <Input {...c} {...register('company_name')} autoComplete="organization" disabled={isSubmitting} />}
        </FormField>
        <FormField label="Tipo de vínculo" hint="Texto livre, até 40 caracteres." error={errors.employment_type?.message}>
          {(c) => <Input {...c} {...register('employment_type')} disabled={isSubmitting} />}
        </FormField>
        <div className="hidden sm:block" aria-hidden="true" />
        <FormField label="Cidade" error={errors.city?.message}>
          {(c) => <Input {...c} {...register('city')} disabled={isSubmitting} />}
        </FormField>
        <FormField label="País" error={errors.country?.message}>
          {(c) => <Input {...c} {...register('country')} disabled={isSubmitting} />}
        </FormField>
      </div>
      <PeriodFields
        register={register}
        setValue={setValue}
        errors={errors}
        isCurrent={isCurrent}
        currentLabel="Trabalho aqui actualmente"
        disabled={isSubmitting}
      />
      <FormField label="Descrição" error={errors.description?.message}>
        {(c) => <Textarea {...c} {...register('description')} rows={4} disabled={isSubmitting} />}
      </FormField>
      <FormActions submitting={isSubmitting} onCancel={onCancel} />
    </form>
  )
}
