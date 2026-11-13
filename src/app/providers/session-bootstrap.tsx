import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { bootstrapSession, retryBootstrap } from '@/modules/auth/session'
import { useSessionStore } from '@/modules/auth/store'
import { ErrorState } from '@/shared/components/error-state'
import { LoadingState } from '@/shared/components/loading-state'

/** Blocks rendering until the session is restored (refresh + /auth/me) or ruled out. */
export function SessionBootstrap() {
  const status = useSessionStore((state) => state.status)
  const error = useSessionStore((state) => state.bootstrapError)

  useEffect(() => {
    void bootstrapSession()
  }, [])

  if (status === 'idle' || status === 'loading') {
    return <LoadingState fullScreen label="A preparar a tua sessão…" />
  }

  if (status === 'error') {
    return (
      <ErrorState fullScreen error={error} onRetry={() => void retryBootstrap()} />
    )
  }

  return <Outlet />
}
