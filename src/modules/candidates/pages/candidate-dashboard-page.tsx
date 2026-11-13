import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { paths } from '@/app/router/paths'
import { useMyCandidateProfile } from '@/modules/candidates/hooks/use-my-candidate-profile'
import { greetingName, profileSummary } from '@/modules/candidates/profile-display'
import { Banner } from '@/shared/components/banner'
import { DetailList } from '@/shared/components/detail-list'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/error-state'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * Candidate dashboard, /painel (CLAUDE.md §5.2, wireframe 1).
 *
 * Built only on endpoints that exist: GET /candidates/me. The recommendations carousel
 * (GET /matching/recommendations) and recent applications (GET /applications/me) are
 * part of the planned page but are not in the backend's OpenAPI yet, so they are not
 * rendered (CLAUDE.md §1.1: no invented endpoints or data).
 */
export function CandidateDashboardPage() {
  const { state, reload } = useMyCandidateProfile()

  if (state.status === 'loading') return <DashboardSkeleton />

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <ErrorState title="Não foi possível carregar o painel" error={state.error} onRetry={reload} />
      </div>
    )
  }

  const profile = state.data
  const name = greetingName(profile)

  return (
    <div className="space-y-10">
      <Banner
        title={name ? `Olá, ${name}` : 'Bem-vindo ao iKnow'}
        description={
          profile?.headline?.trim() ||
          'Completa o teu perfil para melhorares as recomendações.'
        }
        action={
          <Button asChild variant="outline" className="border-foreground/20 bg-card hover:bg-card/90">
            <Link to={paths.candidateProfile}>{profile ? 'Ver o meu perfil' : 'Completar perfil'}</Link>
          </Button>
        }
      />

      <section aria-labelledby="profile-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="profile-heading" className="text-lg font-semibold">
            O teu perfil
          </h2>
          {profile ? (
            <Link
              to={paths.candidateProfile}
              className="rounded-sm text-sm font-medium underline decoration-primary decoration-2 underline-offset-4 hover:decoration-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Editar perfil
            </Link>
          ) : null}
        </div>

        {profile ? (
          <DetailList items={profileSummary(profile)} />
        ) : (
          <EmptyState
            icon={UserRound}
            title="Ainda não criaste o teu perfil"
            description="Indica os teus dados, competências, experiência e formação para receberes recomendações."
            action={
              <Button asChild>
                <Link to={paths.candidateProfile}>Completar perfil</Link>
              </Button>
            }
          />
        )}
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
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
