import { Link } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço que procuras não existe.</p>
      {/* "/" sends signed-in users to their home page and everyone else to /entrar. */}
      <Button asChild variant="outline" className="mt-4">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </main>
  )
}
