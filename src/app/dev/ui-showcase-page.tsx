import { useState, type ReactNode } from 'react'
import { AlertCircle, Building2, Check, Inbox, Loader2, RotateCcw } from 'lucide-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/utils/cn'

/**
 * Development-only showcase of the base components in every state required by
 * CLAUDE.md §9 (normal, hover, focus, disabled, loading, success, error, empty).
 * "Hover" and "focus" columns force the visual state with the same classes the
 * components apply, so they can be compared side by side. All text is placeholder.
 */

const FORCED_FOCUS = 'ring-2 ring-ring ring-offset-2 ring-offset-background'

const buttonVariants = [
  { variant: 'default', label: 'Primário', hover: 'bg-primary-hover' },
  { variant: 'outline', label: 'Contorno', hover: 'bg-accent text-accent-foreground' },
  { variant: 'secondary', label: 'Secundário', hover: 'bg-secondary/80' },
  { variant: 'ghost', label: 'Fantasma', hover: 'bg-accent text-accent-foreground' },
  { variant: 'destructive', label: 'Destrutivo', hover: 'bg-destructive/90' },
  { variant: 'link', label: 'Ligação', hover: 'decoration-primary-hover' },
] as const

export function UiShowcasePage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-12 px-8 py-12">
      <header className="flex flex-col gap-2">
        <Badge variant="outline">Apenas em desenvolvimento</Badge>
        <h1 className="text-3xl font-bold">Componentes base</h1>
        <p className="text-muted-foreground">
          Estados obrigatórios: normal, hover, focus, disabled, loading, success, error e empty. As
          colunas “hover” e “focus” estão forçadas para comparação; usa a linha interactiva para
          testar com rato e teclado (Tab).
        </p>
      </header>

      <ColorTokens />
      <ButtonsSection />
      <InputsSection />
      <CardsSection />
    </main>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function StateLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground uppercase">{children}</span>
}

/* ------------------------------------------------------------------ tokens */

const tokens = [
  { name: 'primary', className: 'bg-primary', value: '#F5C518' },
  { name: 'primary-hover', className: 'bg-primary-hover', value: '#DDAF08' },
  { name: 'foreground', className: 'bg-foreground', value: '#171717' },
  { name: 'background', className: 'bg-background', value: '#F5F5F2' },
  { name: 'card', className: 'bg-card', value: '#FFFFFF' },
  { name: 'muted-foreground', className: 'bg-muted-foreground', value: '#737373' },
  { name: 'border', className: 'bg-border', value: '#E5E5E0' },
  { name: 'destructive', className: 'bg-destructive', value: '#DC2626' },
  { name: 'success', className: 'bg-success', value: '#16A34A' },
]

function ColorTokens() {
  return (
    <Section title="Tokens de cor" description="CLAUDE.md §3">
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-9">
        {tokens.map((token) => (
          <div key={token.name} className="flex flex-col gap-2">
            <div className={cn('h-16 rounded-lg border', token.className)} />
            <div className="text-sm font-medium">{token.name}</div>
            <div className="text-xs text-muted-foreground">{token.value}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ----------------------------------------------------------------- buttons */

function ButtonsSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function simulate(outcome: 'success' | 'error') {
    setStatus('loading')
    window.setTimeout(() => setStatus(outcome), 1200)
  }

  return (
    <Section title="Botões">
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr>
                {['Variante', 'Normal', 'Hover', 'Focus', 'Disabled', 'Loading'].map((h) => (
                  <th key={h} className="pr-4">
                    <StateLabel>{h}</StateLabel>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buttonVariants.map(({ variant, label, hover }) => (
                <tr key={variant}>
                  <td className="pr-4 text-sm font-medium">{label}</td>
                  <td className="pr-4">
                    <Button variant={variant}>Guardar</Button>
                  </td>
                  <td className="pr-4">
                    <Button variant={variant} className={hover} tabIndex={-1}>
                      Guardar
                    </Button>
                  </td>
                  <td className="pr-4">
                    <Button variant={variant} className={FORCED_FOCUS} tabIndex={-1}>
                      Guardar
                    </Button>
                  </td>
                  <td className="pr-4">
                    <Button variant={variant} disabled>
                      Guardar
                    </Button>
                  </td>
                  <td className="pr-4">
                    <Button variant={variant} disabled aria-busy="true">
                      <Loader2 className="animate-spin" aria-hidden="true" />A guardar…
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactivo: loading → success / error</CardTitle>
          <CardDescription>Simula uma submissão (sem pedidos à API).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button
            onClick={() => simulate('success')}
            disabled={status === 'loading'}
            aria-busy={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />A guardar…
              </>
            ) : (
              'Simular sucesso'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => simulate('error')}
            disabled={status === 'loading'}
          >
            Simular erro
          </Button>
          <div role="status" aria-live="polite" className="text-sm">
            {status === 'success' ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="size-4" aria-hidden="true" /> Alterações guardadas.
              </span>
            ) : null}
            {status === 'error' ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                <AlertCircle className="size-4" aria-hidden="true" /> Não foi possível guardar.
                Tenta novamente.
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <StateLabel>Tamanhos</StateLabel>
        <Button size="sm">Pequeno</Button>
        <Button>Normal</Button>
        <Button size="lg">Grande</Button>
        <Button size="icon" aria-label="Notificações">
          <Inbox />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StateLabel>Badges</StateLabel>
        <Badge>Primário</Badge>
        <Badge variant="secondary">Secundário</Badge>
        <Badge variant="outline">Contorno</Badge>
        <Badge variant="success">Sucesso</Badge>
        <Badge variant="destructive">Erro</Badge>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ inputs */

function Field({
  id,
  label,
  hint,
  error,
  success,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  success?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-message`} className="text-sm text-destructive">
          {error}
        </p>
      ) : success ? (
        <p id={`${id}-message`} className="text-sm text-success">
          {success}
        </p>
      ) : hint ? (
        <p id={`${id}-message`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function InputsSection() {
  return (
    <Section title="Campos de texto">
      <Card>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Field id="in-normal" label="Normal" hint="Texto de ajuda.">
            <Input id="in-normal" defaultValue="ana@exemplo.pt" aria-describedby="in-normal-message" />
          </Field>
          <Field id="in-empty" label="Vazio (placeholder)">
            <Input id="in-empty" placeholder="nome@empresa.pt" />
          </Field>
          <Field id="in-hover" label="Hover (forçado)">
            <Input id="in-hover" className="border-muted-foreground/40" tabIndex={-1} placeholder="nome@empresa.pt" />
          </Field>
          <Field id="in-focus" label="Focus (forçado)">
            <Input id="in-focus" className={FORCED_FOCUS} tabIndex={-1} placeholder="nome@empresa.pt" />
          </Field>
          <Field id="in-disabled" label="Disabled">
            <Input id="in-disabled" disabled defaultValue="Não editável" />
          </Field>
          <Field id="in-loading" label="Loading" hint="A validar…">
            <div className="relative">
              <Input id="in-loading" defaultValue="empresa-exemplo" aria-busy="true" className="pr-9" />
              <Loader2
                className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </Field>
          <Field id="in-success" label="Success" success="Disponível.">
            <Input
              id="in-success"
              defaultValue="empresa-exemplo"
              className="border-success"
              aria-describedby="in-success-message"
            />
          </Field>
          <Field id="in-error" label="Error" error="Introduz um email válido.">
            <Input
              id="in-error"
              defaultValue="ana@"
              aria-invalid="true"
              aria-describedby="in-error-message"
            />
          </Field>
        </CardContent>
      </Card>
    </Section>
  )
}

/* ------------------------------------------------------------------- cards */

function CardShell({ state, children }: { state: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <StateLabel>{state}</StateLabel>
      {children}
    </div>
  )
}

function SampleCardBody() {
  return (
    <>
      <div className="mx-6 h-28 rounded-lg bg-background" aria-hidden="true" />
      <CardHeader className="grid-cols-[auto_1fr] grid-rows-1 items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-background">
          <Building2 className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle>Título de exemplo</CardTitle>
          <CardDescription>Informação secundária</CardDescription>
        </div>
      </CardHeader>
    </>
  )
}

function CardsSection() {
  return (
    <Section
      title="Cartões"
      description="Cartão do padrão Dashboard (capa, círculo e duas linhas). Texto de exemplo."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CardShell state="Normal">
          <Card>
            <SampleCardBody />
          </Card>
        </CardShell>

        <CardShell state="Hover (forçado)">
          <Card className="shadow-md">
            <SampleCardBody />
          </Card>
        </CardShell>

        <CardShell state="Focus (interactivo — Tab)">
          <a
            href="#cartoes"
            onClick={(event) => event.preventDefault()}
            className="rounded-xl transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="h-full">
              <SampleCardBody />
            </Card>
          </a>
        </CardShell>

        <CardShell state="Disabled">
          <Card className="opacity-50" aria-disabled="true">
            <SampleCardBody />
          </Card>
        </CardShell>

        <CardShell state="Loading">
          <Card aria-busy="true" aria-label="A carregar">
            <div className="mx-6 h-28 animate-pulse rounded-lg bg-border" />
            <div className="flex items-center gap-3 px-6">
              <div className="size-10 animate-pulse rounded-full bg-border" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
            </div>
          </Card>
        </CardShell>

        <CardShell state="Success">
          <Card className="border-success/40">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
                <Check className="size-5 text-success" aria-hidden="true" />
              </div>
              <CardTitle>Operação concluída</CardTitle>
              <CardDescription>As alterações foram guardadas.</CardDescription>
            </CardContent>
          </Card>
        </CardShell>

        <CardShell state="Error">
          <Card className="border-destructive/40" role="alert">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
              </div>
              <CardTitle>Não foi possível carregar</CardTitle>
              <CardDescription>Ocorreu um problema. Tenta novamente.</CardDescription>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button variant="outline" size="sm">
                <RotateCcw aria-hidden="true" /> Tentar novamente
              </Button>
              <span className="text-xs text-muted-foreground">ID do pedido: 00000000-exemplo</span>
            </CardFooter>
          </Card>
        </CardShell>

        <CardShell state="Empty">
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-background">
                <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <CardTitle>Sem resultados</CardTitle>
              <CardDescription>Ainda não existem itens para mostrar.</CardDescription>
            </CardContent>
          </Card>
        </CardShell>
      </div>
    </Section>
  )
}
