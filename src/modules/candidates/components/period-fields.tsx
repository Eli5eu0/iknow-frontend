import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { FormField } from '@/shared/components/form-field'
import { Input } from '@/shared/components/ui/input'

type PeriodValues = { start_date: string; end_date: string; is_current: boolean }

interface PeriodFieldsProps<T extends PeriodValues> {
  register: UseFormRegister<T>
  setValue: UseFormSetValue<T>
  errors: FieldErrors<T>
  isCurrent: boolean
  currentLabel: string
  disabled: boolean
}

/** Start date, "current" checkbox and end date (cleared and disabled while current). */
export function PeriodFields<T extends PeriodValues>({
  register,
  setValue,
  errors,
  isCurrent,
  currentLabel,
  disabled,
}: PeriodFieldsProps<T>) {
  // The generic form type hides these keys from react-hook-form's path types.
  const reg = register as unknown as UseFormRegister<PeriodValues>
  const set = setValue as unknown as UseFormSetValue<PeriodValues>
  const errs = errors as FieldErrors<PeriodValues>

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Data de início" error={errs.start_date?.message}>
          {(control) => <Input {...control} {...reg('start_date')} type="date" disabled={disabled} />}
        </FormField>
        <FormField label="Data de fim" error={errs.end_date?.message}>
          {(control) => (
            <Input {...control} {...reg('end_date')} type="date" disabled={disabled || isCurrent} />
          )}
        </FormField>
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          disabled={disabled}
          {...reg('is_current', {
            onChange: (event: { target: { checked: boolean } }) => {
              if (event.target.checked) set('end_date', '', { shouldValidate: true })
            },
          })}
        />
        {currentLabel}
      </label>
    </div>
  )
}
