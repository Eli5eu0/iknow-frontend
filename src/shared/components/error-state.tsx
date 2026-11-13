import { AlertCircle, RotateCcw } from 'lucide-react'

import { isApiError } from '@/shared/api/errors'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

const FALLBACK_MESSAGE = 'Ocorreu um erro inesperado. Tenta novamente.'

interface ErrorStateProps {
  title?: string
  /**
   * The caught error. For an `ApiError` its Portuguese `message` and `requestId` are used.
   * The backend's own text (`serverMessage`) is never shown (guia visual §11.4).
   */
  error?: unknown
  /** Overrides the message derived from `error`. */
  message?: string
  /** Overrides the request id derived from `error`. */
  requestId?: string | null
  onRetry?: () => void
  retrying?: boolean
  fullScreen?: boolean
  className?: string
}

export function ErrorState({
  title = 'Não foi possível carregar',
  error,
  message,
  requestId,
  onRetry,
  retrying = false,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const apiError = isApiError(error) ? error : null
  const text = message ?? apiError?.message ?? FALLBACK_MESSAGE
  const id = requestId ?? apiError?.requestId ?? null

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 text-center',
        fullScreen ? 'min-h-screen' : 'py-12',
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{text}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
          <RotateCcw className={cn(retrying && 'animate-spin')} aria-hidden="true" />
          Tentar novamente
        </Button>
      ) : null}
      {id ? (
        <span className="font-mono text-xs text-muted-foreground select-all">
          ID do pedido: {id}
        </span>
      ) : null}
    </div>
  )
}
