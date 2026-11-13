import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/auth-layout'
import { paths } from '@/app/router/paths'
import { PASSWORD_MIN_LENGTH, registerSchema, type RegisterFormValues } from '@/modules/auth/schemas'
import { register as registerAccount } from '@/modules/auth/session'
import type { UserRole } from '@/modules/auth/types'
import { isApiError } from '@/shared/api/errors'
import { FormAlert } from '@/shared/components/form-alert'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { PasswordInput } from '@/shared/components/password-input'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'
import { applyServerErrors } from '@/shared/utils/form-errors'

const roleOptions: { value: UserRole; label: string; description: string; icon: typeof UserRound }[] = [
  { value: 'CANDIDATE', label: 'Candidato', description: 'Procuro oportunidades', icon: UserRound },
  { value: 'COMPANY', label: 'Empresa', description: 'Quero publicar oportunidades', icon: Building2 },
]

/**
 * POST /auth/register (email, password, role). The backend signs the new user in, so
 * <GuestOnly> then sends them to the home page of their role.
 */
export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  })
  const selectedRole = useWatch({ control, name: 'role' })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerAccount(values)
    } catch (error) {
      if (isApiError(error) && error.kind === 'http' && error.status === 409) {
        setError('email', { type: 'server', message: 'Já existe uma conta com este email.' })
        return
      }
      setFormError(applyServerErrors(error, setError, ['role', 'email', 'password']))
    }
  })

  const loginHref = searchParams.has('next')
    ? `${paths.login}?${new URLSearchParams({ next: searchParams.get('next') ?? '' })}`
    : paths.login

  return (
    <AuthLayout
      asideTitle="Candidatos e empresas, ligados pelas competências."
      asideText="Cria a tua conta para encontrares oportunidades ou publicares as da tua empresa."
    >
      <FormCard
        title="Criar conta"
        description="Escolhe o tipo de conta e indica os teus dados."
        footer={
          <>
            Já tens conta?{' '}
            <Link
              to={loginHref}
              className="rounded-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Entrar
            </Link>
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} className="space-y-5">
          <FormAlert message={formError} />

          <fieldset
            className="space-y-2"
            aria-describedby={errors.role ? 'role-error' : undefined}
            disabled={isSubmitting}
          >
            <legend className="mb-2 text-sm leading-none font-medium">Tipo de conta</legend>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map(({ value, label, description, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary-hover',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60',
                    selectedRole === value ? 'border-primary bg-primary/10' : 'border-border',
                    errors.role && 'border-destructive',
                  )}
                >
                  <input type="radio" value={value} {...register('role')} className="sr-only" />
                  <Icon className="size-5 text-foreground" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.role ? (
              <p id="role-error" className="text-sm text-destructive">
                {errors.role.message}
              </p>
            ) : null}
          </fieldset>

          <FormField label="Email" error={errors.email?.message}>
            {(control) => (
              <Input
                {...control}
                {...register('email')}
                type="email"
                autoComplete="email"
                inputMode="email"
                disabled={isSubmitting}
              />
            )}
          </FormField>

          <FormField
            label="Palavra-passe"
            error={errors.password?.message}
            hint={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`}
          >
            {(control) => (
              <PasswordInput
                {...control}
                {...register('password')}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            )}
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? 'A criar conta…' : 'Criar conta'}
          </Button>
        </form>
      </FormCard>
    </AuthLayout>
  )
}
