import { Briefcase, Plus } from 'lucide-react'
import { useState } from 'react'

import { ApiError } from '@/shared/api/errors'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/error-state'
import { LoadingState } from '@/shared/components/loading-state'
import { PageHeader } from '@/shared/components/page-header'
import { Button } from '@/shared/components/ui/button'

/**
 * Development-only page rendered inside the real AppLayout (behind RequireAuth), to check
 * the sidebar for the signed-in role and the shared state components.
 * All texts below are examples; no data comes from the API.
 */
export function LayoutShowcasePage() {
  const [retrying, setRetrying] = useState(false)
  const exampleError = new ApiError({
    kind: 'http',
    status: 500,
    message: 'Ocorreu um erro inesperado. Tenta novamente.',
    requestId: '00000000-exemplo-0000',
  })

  function retry() {
    setRetrying(true)
    setTimeout(() => setRetrying(false), 1200)
  }

  return (
    <>
      <PageHeader
        title="Layout e estados (dev)"
        description="Exemplos dos componentes partilhados. Página só de desenvolvimento."
        actions={
          <>
            <Button variant="outline">Acção secundária</Button>
            <Button>
              <Plus aria-hidden="true" /> Acção principal
            </Button>
          </>
        }
      />

      <div className="space-y-10">
        <Section title="EmptyState">
          <EmptyState
            icon={Briefcase}
            title="Ainda não existem oportunidades disponíveis"
            description="Quando houver oportunidades compatíveis com o teu perfil, aparecem aqui."
            action={<Button variant="outline">Acção sugerida</Button>}
          />
        </Section>

        <Section title="LoadingState — cards">
          <LoadingState variant="cards" count={4} label="A carregar oportunidades…" />
        </Section>

        <Section title="LoadingState — list">
          <LoadingState variant="list" count={3} label="A carregar candidaturas…" />
        </Section>

        <Section title="LoadingState — spinner">
          <div className="rounded-xl border border-border bg-card">
            <LoadingState />
          </div>
        </Section>

        <Section title="ErrorState (com request_id de exemplo)">
          <div className="rounded-xl border border-border bg-card">
            <ErrorState error={exampleError} onRetry={retry} retrying={retrying} />
          </div>
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}
