import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/auth-layout'
import { paths } from '@/app/router/paths'
import { useSessionStore } from '@/modules/auth/store'
import { companiesApi } from '@/modules/companies/api'
import {
  firstIncompleteStep,
  onboardingSteps,
  requiredFieldLabels,
  stepDefaults,
  stepPayload,
  type OnboardingField,
  type OnboardingStep,
} from '@/modules/companies/onboarding'
import type { Company } from '@/modules/companies/types'
import { isApiError } from '@/shared/api/errors'
import { ErrorState } from '@/shared/components/error-state'
import { FormAlert } from '@/shared/components/form-alert'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { LoadingState } from '@/shared/components/loading-state'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { useApiResource } from '@/shared/hooks/use-api-resource'
import { cn } from '@/shared/utils/cn'
import { applyServerErrors } from '@/shared/utils/form-errors'

const fieldConfig: Record<
  OnboardingField,
  { label: string; multiline?: boolean; autoComplete?: string; hint?: string; type?: string }
> = {
  name: { label: 'Nome da empresa', autoComplete: 'organization', hint: 'O nome que os candidatos vão ver.' },
  legal_name: { label: 'Denominação legal' },
  tax_id: { label: 'Número de identificação fiscal' },
  description: { label: 'Descrição', multiline: true },
  website: { label: 'Website (opcional)', type: 'url', autoComplete: 'url', hint: 'Começa por http:// ou https://.' },
  city: { label: 'Cidade', autoComplete: 'address-level2' },
  country: { label: 'País', autoComplete: 'country-name' },
}

/**
 * /empresa/onboarding (CLAUDE.md §5.3, D07): complete the company profile in steps,
 * saving each step with PATCH /companies/me. Starts at the first step with missing fields.
 */
export function CompanyOnboardingPage() {
  const clearLandingPath = useSessionStore((state) => state.clearLandingPath)
  const { state, reload, setData } = useApiResource((signal) => companiesApi.getMe(signal))

  // The post-login redirect to this page has been used.
  useEffect(() => clearLandingPath(), [clearLandingPath])

  return (
    <AuthLayout
      asideTitle="Apresenta a tua empresa."
      asideText="Um perfil completo ajuda os candidatos a conhecer a empresa. Podes guardar e continuar mais tarde."
    >
      {state.status === 'loading' ? <LoadingState label="A carregar o perfil da empresa…" /> : null}
      {state.status === 'error' ? (
        <ErrorState title="Não foi possível carregar o perfil" error={state.error} onRetry={reload} />
      ) : null}
      {state.status === 'success' ? <OnboardingWizard company={state.data} onSaved={setData} /> : null}
    </AuthLayout>
  )
}

function OnboardingWizard({ company, onSaved }: { company: Company; onSaved: (company: Company) => void }) {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(() => firstIncompleteStep(company.missing_fields))
  const [missingAfterFinish, setMissingAfterFinish] = useState<Company['missing_fields']>([])
  const step = onboardingSteps[stepIndex] ?? onboardingSteps[0]
  const isLast = stepIndex === onboardingSteps.length - 1

  function handleSaved(updated: Company) {
    onSaved(updated)
    if (!isLast) {
      setStepIndex(stepIndex + 1)
      return
    }
    if (updated.profile_completed) {
      navigate(paths.companyHome, { replace: true })
      return
    }
    // A field was left empty in an earlier step: show what is missing and go there.
    setMissingAfterFinish(updated.missing_fields)
    setStepIndex(firstIncompleteStep(updated.missing_fields))
  }

  return (
    <FormCard
      title="Perfil da empresa"
      description={`Passo ${stepIndex + 1} de ${onboardingSteps.length}: ${step.title}. ${step.description}`}
      footer={<StepIndicator current={stepIndex} />}
    >
      {missingAfterFinish.length > 0 ? (
        <div className="mb-4">
          <FormAlert
            message={`Ainda faltam campos obrigatórios: ${missingAfterFinish.map((field) => requiredFieldLabels[field]).join(', ')}.`}
          />
        </div>
      ) : null}
      {/* key: a fresh form (and defaults) for each step. */}
      <StepForm
        key={step.id}
        step={step}
        company={company}
        isFirst={stepIndex === 0}
        isLast={isLast}
        onBack={() => setStepIndex(stepIndex - 1)}
        onSaved={handleSaved}
      />
    </FormCard>
  )
}

interface StepFormProps {
  step: OnboardingStep
  company: Company
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onSaved: (company: Company) => void
}

function StepForm({ step, company, isFirst, isLast, onBack, onSaved }: StepFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({
    // The step schemas differ in shape; the form works with plain string fields.
    resolver: zodResolver(step.schema) as unknown as Resolver<Record<string, string>>,
    defaultValues: stepDefaults(step, company),
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      onSaved(await companiesApi.updateMe(stepPayload(values)))
    } catch (error) {
      if (isApiError(error) && error.kind === 'http' && error.status === 409) {
        setError('tax_id', {
          type: 'server',
          message: 'Este número de identificação fiscal já está registado.',
        })
        return
      }
      setFormError(applyServerErrors(error, setError, step.fields))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormAlert message={formError} />

      {step.fields.map((field) => {
        const config = fieldConfig[field]
        return (
          <FormField key={field} label={config.label} hint={config.hint} error={errors[field]?.message}>
            {(control) =>
              config.multiline ? (
                <Textarea {...control} {...register(field)} rows={5} disabled={isSubmitting} />
              ) : (
                <Input
                  {...control}
                  {...register(field)}
                  type={config.type ?? 'text'}
                  autoComplete={config.autoComplete ?? 'off'}
                  disabled={isSubmitting}
                />
              )
            }
          </FormField>
        )
      })}

      <div className="flex items-center gap-3 pt-2">
        {!isFirst ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft aria-hidden="true" /> Voltar
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'A guardar…' : isLast ? 'Guardar e concluir' : 'Guardar e continuar'}
        </Button>
      </div>

      <p className="text-center text-sm">
        <Link
          to={paths.companyHome}
          className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Terminar mais tarde
        </Link>
      </p>
    </form>
  )
}

/** Wireframe 2's three small marks at the bottom of the form: the onboarding steps. */
function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="Passos do perfil">
      {onboardingSteps.map((step, index) => (
        <li key={step.id} aria-current={index === current ? 'step' : undefined}>
          <span
            className={cn(
              'block h-2 rounded-full transition-all',
              index === current ? 'w-8 bg-primary' : index < current ? 'w-2 bg-foreground' : 'w-2 bg-border',
            )}
          />
          <span className="sr-only">
            {`Passo ${index + 1}: ${step.title}${index === current ? ' (actual)' : ''}`}
          </span>
        </li>
      ))}
    </ol>
  )
}
