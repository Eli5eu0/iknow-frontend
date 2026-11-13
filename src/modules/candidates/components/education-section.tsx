import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { candidatesApi } from '@/modules/candidates/api'
import { FormActions } from '@/modules/candidates/components/form-actions'
import { PeriodFields } from '@/modules/candidates/components/period-fields'
import { RecordFormDialog } from '@/modules/candidates/components/record-form-dialog'
import { RecordListSection, type RecordFormProps } from '@/modules/candidates/components/record-list-section'
import { formatPeriod, joinFilled } from '@/modules/candidates/profile-display'
import {
  educationDefaults,
  educationPayload,
  educationSchema,
  type EducationFormValues,
} from '@/modules/candidates/schemas'
import type { Education } from '@/modules/candidates/types'
import { FormAlert } from '@/shared/components/form-alert'
import { FormField } from '@/shared/components/form-field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { applyServerErrors } from '@/shared/utils/form-errors'

const fields = [
  'institution',
  'degree',
  'field_of_study',
  'city',
  'country',
  'description',
  'start_date',
  'end_date',
  'is_current',
] as const

/** Newest first, like GET /candidates/me/educations (order by start_date desc). */
const byStartDesc = (a: { start_date: string }, b: { start_date: string }) => b.start_date.localeCompare(a.start_date)

export function EducationSection({ onChanged }: { onChanged: () => void }) {
  return (
    <RecordListSection<Education>
      id="education"
      title="Formação"
      description="Cursos e formações, da mais recente para a mais antiga."
      addLabel="Adicionar formação"
      emptyIcon={GraduationCap}
      emptyTitle="Ainda não adicionaste formação"
      emptyDescription="Indica os cursos e formações que concluíste ou estás a frequentar."
      deleteTitle="Eliminar formação?"
      load={(signal) => candidatesApi.listEducations(signal)}
      remove={(id) => candidatesApi.deleteEducation(id)}
      sort={byStartDesc}
      onChanged={onChanged}
      view={(record) => ({
        title: joinFilled([record.degree, record.field_of_study]) ?? record.institution,
        subtitle: joinFilled([
          joinFilled([record.degree, record.field_of_study]) ? record.institution : null,
          joinFilled([record.city, record.country]),
        ]),
        period: formatPeriod(record.start_date, record.end_date, record.is_current),
        description: record.description ?? null,
      })}
      renderForm={(props) => <EducationDialog {...props} />}
    />
  )
}

function EducationDialog({ record, open, onOpenChange, onSaved }: RecordFormProps<Education>) {
  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Editar formação' : 'Adicionar formação'}
      description="Os campos marcados com * são obrigatórios."
    >
      <EducationForm record={record} onCancel={() => onOpenChange(false)} onSaved={onSaved} />
    </RecordFormDialog>
  )
}

function EducationForm({
  record,
  onCancel,
  onSaved,
}: {
  record: Education | null
  onCancel: () => void
  onSaved: (record: Education) => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: educationDefaults(record),
  })
  const isCurrent = useWatch({ control, name: 'is_current' })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const payload = educationPayload(values)
      onSaved(
        record
          ? await candidatesApi.updateEducation(record.id, payload)
          : await candidatesApi.createEducation(payload),
      )
    } catch (error) {
      setFormError(applyServerErrors(error, setError, fields))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <FormField label="Instituição *" error={errors.institution?.message}>
        {(c) => <Input {...c} {...register('institution')} disabled={isSubmitting} />}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Grau" error={errors.degree?.message}>
          {(c) => <Input {...c} {...register('degree')} disabled={isSubmitting} />}
        </FormField>
        <FormField label="Área de estudo" error={errors.field_of_study?.message}>
          {(c) => <Input {...c} {...register('field_of_study')} disabled={isSubmitting} />}
        </FormField>
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
        currentLabel="Estou a frequentar"
        disabled={isSubmitting}
      />
      <FormField label="Descrição" error={errors.description?.message}>
        {(c) => <Textarea {...c} {...register('description')} rows={4} disabled={isSubmitting} />}
      </FormField>
      <FormActions submitting={isSubmitting} onCancel={onCancel} />
    </form>
  )
}
