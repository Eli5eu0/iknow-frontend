import { AuthLayout } from '@/app/layouts/auth-layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

/** Development-only preview of the split layout with a non-functional example form. */
export function AuthLayoutShowcasePage() {
  return (
    <AuthLayout
      asideTitle="Título curto (exemplo)"
      asideText="Texto explicativo de exemplo. A imagem definitiva ainda está por validar."
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Título do formulário</CardTitle>
          <CardDescription>Formulário de exemplo, sem ligação à API.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="dev-email">Email</Label>
              <Input id="dev-email" type="email" autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dev-password">Palavra-passe</Label>
              <Input id="dev-password" type="password" autoComplete="off" />
            </div>
            <Button type="submit" className="w-full">
              Submeter
            </Button>
            {/* Space of the three small buttons in wireframe 2: secondary links [PROPOSTA]. */}
            <p className="text-center text-sm text-muted-foreground">
              Link secundário de exemplo
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
