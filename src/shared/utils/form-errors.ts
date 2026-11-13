import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/api/errors'

const FALLBACK_MESSAGE = 'Ocorreu um erro inesperado. Tenta novamente.'

/**
 * Generic text for server-side field errors. The backend's own messages are in English
 * and are not shown to the user (guia visual §11.4); client validation covers the rules.
 */
export const SERVER_FIELD_ERROR = 'Valor inválido.'

/**
 * Applies a failed submission to a react-hook-form form.
 * - 422 issues for known fields are set next to the field (CLAUDE.md §9).
 * - Everything else becomes a form-level message, which is returned (null when every
 *   problem was attached to a field).
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  if (!isApiError(error)) return FALLBACK_MESSAGE

  const known = fields.filter((field) => field in error.fieldErrors)
  for (const field of known) {
    setError(field, { type: 'server', message: SERVER_FIELD_ERROR })
  }

  const hasUnmappedIssues = Object.keys(error.fieldErrors).some(
    (key) => !(fields as readonly string[]).includes(key),
  )
  if (known.length > 0 && !hasUnmappedIssues) return null
  return error.message
}
