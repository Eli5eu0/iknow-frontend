import { useCallback, useEffect, useState } from 'react'

/**
 * Short "Guardado" confirmation after a successful action, announced to screen readers.
 * Stands in for the success toast of CLAUDE.md §9 until a toast library is approved.
 */
export function useSaveStatus(durationMs = 3000) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), durationMs)
    return () => clearTimeout(timer)
  }, [message, durationMs])

  const show = useCallback((text = 'Guardado.') => setMessage(text), [])
  return { message, show }
}
