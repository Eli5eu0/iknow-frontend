import { useCallback, useEffect, useRef, useState } from 'react'

export type ApiResourceState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown }

/**
 * Loads one API resource on mount: aborts on unmount (and on React StrictMode's double
 * effect), exposes `reload` for "Tentar novamente" and `setData` for local updates after
 * a successful save. Map expected "no data" responses (e.g. 404) inside `fetcher`.
 */
export function useApiResource<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<ApiResourceState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  // Keep the latest fetcher without re-running the load effect on every render.
  // Declared first, so it runs before the load effect below.
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const controller = new AbortController()
    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error })
      })
    return () => controller.abort()
  }, [attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  const setData = useCallback((data: T) => setState({ status: 'success', data }), [])

  return { state, reload, setData }
}
