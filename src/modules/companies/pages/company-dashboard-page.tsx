import { Link } from 'react-router-dom'

import { paths } from '@/app/router/paths'
import { companiesApi } from '@/modules/companies/api'
import { companySummary } from '@/modules/companies/profile-display'
import { verificationCopy } from '@/modules/companies/verification'
import { Banner } from '@/shared/components/banner'
import { DetailList } from '@/shared/components/detail-list'
import { ErrorState } from '@/shared/components/error-state'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useApiResource } from '@/shared/hooks/use-api-resource'

/**
 * Company dashboard, /empresa/painel (CLAUDE.md §5.3, wireframe 1): banner with the
 * profile or verification state, then the company profile.
 *
 * The opportunities section (GET /companies/me/opportunities) belongs to the
 * OPPORTUNITIES module, which the backend does not have yet, so it is not rendered.
 */
export function CompanyDashboardPage() {
  const { state, reload } = useApiResource((signal) => companiesApi.getMe(signal))

  if (state.status === 'loading') return <DashboardSkeleton />

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <ErrorState title="Não foi possível carregar o painel" error={state.error} onRetry={reload} />
      </div>
    )
  }

  const company = state.data
  const missingCount = company.missing_fields.length

  return (
    <div className="space-y-10">
      {company.profile_completed ? (
        <Banner
          title={company.name ?? 'Painel da empresa'}
          description={verificationCopy[company.verification_status].description}
        />
      ) : (
        <Banner
          title={company.name ? `${company.name}: completa o perfil` : 'Completa o perfil da empresa'}
          description={
            missingCount === 1
              ? 'Falta 1 campo obrigatório para o perfil ficar completo.'
              : `Faltam ${missingCount} campos obrigatórios para o perfil ficar completo.`
          }
          action={
            <Button asChild variant="outline" className="border-foreground/20 bg-card hover:bg-card/90">
              <Link to={paths.companyOnboarding}>Completar perfil</Link>
            </Button>
          }
        />
      )}

      <section aria-labelledby="company-profile-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="company-profile-heading" className="text-lg font-semibold">
            Perfil da empresa
          </h2>
          <Link
            to={paths.companyOnboarding}
            className="rounded-sm text-sm font-medium underline decoration-primary decoration-2 underline-offset-4 hover:decoration-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Editar perfil
          </Link>
        </div>
        <DetailList items={companySummary(company)} />
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-10">
      <span className="sr-only">A carregar o painel…</span>
      <Skeleton className="h-36 w-full rounded-xl" aria-hidden="true" />
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
