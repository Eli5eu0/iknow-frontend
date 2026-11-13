import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/auth-layout'
import { paths } from '@/app/router/paths'
import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas'
import { login } from '@/modules/auth/session'
import { isApiError } from '@/shared/api/errors'
import { FormAlert } from '@/shared/components/form-alert'
import { FormCard } from '@/shared/components/form-card'
import { FormField } from '@/shared/components/form-field'
import { PasswordInput } from '@/shared/components/password-input'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { applyServerErrors } from '@/shared/utils/form-errors'

/**
 * POST /auth/login. On success the session is stored in memory and <GuestOnly> sends the
 * user to `?next=` (when safe) or to the home page of their role.
 */
export function LoginPage() {
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
    } catch (error) {
      setFormError(loginErrorMessage(error) ?? applyServerErrors(error, setError, ['email', 'password']))
    }
  })

  const registerHref = searchParams.has('next')
    ? `${paths.register}?${new URLSearchParams({ next: searchParams.get('next') ?? '' })}`
    : paths.register

  return (
    <AuthLayout
      asideTitle="Competências que abrem portas."
      asideText="Acompanha as tuas candidaturas e as oportunidades recomendadas para o teu perfil."
    >
      <FormCard
        title="Entrar"
        description="Inicia sessão na tua conta iKnow."
        footer={
          <>
            Ainda não tens conta?{' '}
            <Link
              to={registerHref}
              className="rounded-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Criar conta
            </Link>
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <FormAlert message={formError} />

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

          <FormField label="Palavra-passe" error={errors.password?.message}>
            {(control) => (
              <PasswordInput
                {...control}
                {...register('password')}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            )}
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? 'A entrar…' : 'Entrar'}
          </Button>
        </form>
      </FormCard>
    </AuthLayout>
  )
}

/** Login-specific messages; null lets the generic handling decide. */
function loginErrorMessage(error: unknown): string | null {
  if (!isApiError(error) || error.kind !== 'http') return null
  if (error.status === 401) return 'Email ou palavra-passe incorrectos.'
  // Matched on the backend text until error codes exist (open question 4).
  if (error.status === 403 && error.serverMessage === 'Account is inactive') {
    return 'Esta conta está desactivada.'
  }
  return null
}
