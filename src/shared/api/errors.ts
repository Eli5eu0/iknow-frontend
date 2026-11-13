/**
 * Typed API error and conversion from backend responses.
 *
 * Two body formats are accepted, because the backend does not yet follow the contract:
 *  - Contract (§1.1):  { error: { code, message, details, request_id } }
 *  - FastAPI default:  { detail: string } | { detail: [{ loc, msg, type }] }
 *
 * `message` is always a user-facing Portuguese text chosen by HTTP status. The backend
 * text (currently English) is kept in `serverMessage` for logs and debugging.
 */

export type FieldErrors = Record<string, string>

export type ApiErrorKind = 'http' | 'network'

export interface ApiErrorInit {
  kind: ApiErrorKind
  status: number
  message: string
  code?: string | null
  serverMessage?: string | null
  details?: unknown
  requestId?: string | null
  fieldErrors?: FieldErrors
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  /** HTTP status; 0 for network failures. */
  readonly status: number
  /** Machine-readable code from the backend (contract format only). */
  readonly code: string | null
  readonly serverMessage: string | null
  readonly details: unknown
  readonly requestId: string | null
  /** Validation errors keyed by field path (e.g. "email", "address.city"). */
  readonly fieldErrors: FieldErrors

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status
    this.code = init.code ?? null
    this.serverMessage = init.serverMessage ?? null
    this.details = init.details ?? null
    this.requestId = init.requestId ?? null
    this.fieldErrors = init.fieldErrors ?? {}
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isValidation() {
    return this.status === 422
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'O pedido é inválido.',
  401: 'A tua sessão expirou. Inicia sessão novamente.',
  403: 'Não tens permissão para realizar esta acção.',
  404: 'O recurso pedido não foi encontrado.',
  409: 'O pedido entra em conflito com o estado actual.',
  422: 'Alguns campos têm erros. Revê os dados introduzidos.',
  429: 'Demasiados pedidos, tenta novamente em instantes.',
}

const FALLBACK_MESSAGE = 'Ocorreu um erro inesperado. Tenta novamente.'
const NETWORK_MESSAGE = 'Não foi possível contactar o servidor. Verifica a tua ligação.'

export function messageForStatus(status: number): string {
  return STATUS_MESSAGES[status] ?? FALLBACK_MESSAGE
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

interface ValidationIssue {
  loc: (string | number)[]
  msg: string
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return (
    isRecord(value) &&
    Array.isArray(value.loc) &&
    value.loc.every((part) => typeof part === 'string' || typeof part === 'number') &&
    typeof value.msg === 'string'
  )
}

/** Location prefixes FastAPI adds that are not part of the form field name. */
const LOCATION_PREFIXES = new Set(['body', 'query', 'path', 'header', 'cookie'])

/**
 * Converts FastAPI/Pydantic validation issues into `{ fieldPath: message }`.
 * The first message for each field wins. Issues without a field (e.g. whole body)
 * are stored under the "_root" key.
 */
export function toFieldErrors(issues: unknown): FieldErrors {
  if (!Array.isArray(issues)) return {}

  const result: FieldErrors = {}
  for (const issue of issues) {
    if (!isValidationIssue(issue)) continue
    const parts = issue.loc.filter((part, index) => {
      return !(index === 0 && typeof part === 'string' && LOCATION_PREFIXES.has(part))
    })
    const key = parts.length > 0 ? parts.join('.') : '_root'
    if (!(key in result)) result[key] = issue.msg
  }
  return result
}

/** Builds an ApiError from an HTTP status and an already-parsed body (or null). */
export function apiErrorFromBody(status: number, body: unknown): ApiError {
  const message = messageForStatus(status)

  // Contract format
  if (isRecord(body) && isRecord(body.error)) {
    const error = body.error
    return new ApiError({
      kind: 'http',
      status,
      message,
      code: asString(error.code),
      serverMessage: asString(error.message),
      details: error.details ?? null,
      requestId: asString(error.request_id),
      fieldErrors: toFieldErrors(error.details),
    })
  }

  // FastAPI default format
  if (isRecord(body) && 'detail' in body) {
    const detail = body.detail
    return new ApiError({
      kind: 'http',
      status,
      message,
      serverMessage: asString(detail),
      details: Array.isArray(detail) ? detail : null,
      fieldErrors: toFieldErrors(detail),
    })
  }

  return new ApiError({ kind: 'http', status, message })
}

/** Reads a failed fetch Response (JSON or not) and converts it into an ApiError. */
export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    const text = await response.text()
    body = text ? (JSON.parse(text) as unknown) : null
  } catch {
    body = null
  }
  return apiErrorFromBody(response.status, body)
}

export function networkError(cause: unknown): ApiError {
  const error = new ApiError({ kind: 'network', status: 0, message: NETWORK_MESSAGE })
  ;(error as { cause?: unknown }).cause = cause
  return error
}
