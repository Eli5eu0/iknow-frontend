import { describe, expect, it } from 'vitest'

import {
  ApiError,
  apiErrorFromBody,
  apiErrorFromResponse,
  isApiError,
  networkError,
  toFieldErrors,
} from '@/shared/api/errors'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('apiErrorFromBody — contract format', () => {
  it('maps code, details and request_id and uses a Portuguese message', () => {
    const error = apiErrorFromBody(409, {
      error: {
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'Email already registered',
        details: null,
        request_id: '8f0c6b7e-0000-4000-8000-000000000001',
      },
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.kind).toBe('http')
    expect(error.status).toBe(409)
    expect(error.code).toBe('EMAIL_ALREADY_REGISTERED')
    expect(error.serverMessage).toBe('Email already registered')
    expect(error.requestId).toBe('8f0c6b7e-0000-4000-8000-000000000001')
    expect(error.message).toBe('O pedido entra em conflito com o estado actual.')
    expect(error.fieldErrors).toEqual({})
  })

  it('maps validation details in the contract envelope to field errors', () => {
    const error = apiErrorFromBody(422, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payload',
        details: [{ loc: ['body', 'password'], msg: 'Too short', type: 'string_too_short' }],
        request_id: 'req-1',
      },
    })

    expect(error.isValidation).toBe(true)
    expect(error.fieldErrors).toEqual({ password: 'Too short' })
  })
})

describe('apiErrorFromBody — FastAPI default format', () => {
  it('keeps a string detail as serverMessage, with no code or request id', () => {
    const error = apiErrorFromBody(401, { detail: 'Invalid email or password' })

    expect(error.status).toBe(401)
    expect(error.isUnauthorized).toBe(true)
    expect(error.code).toBeNull()
    expect(error.requestId).toBeNull()
    expect(error.serverMessage).toBe('Invalid email or password')
    expect(error.message).toBe('A tua sessão expirou. Inicia sessão novamente.')
  })

  it('converts a 422 detail array into field errors', () => {
    const error = apiErrorFromBody(422, {
      detail: [
        { loc: ['body', 'email'], msg: 'Value error, Invalid email address', type: 'value_error' },
        { loc: ['body', 'password'], msg: 'String should have at least 12 characters', type: 'string_too_short' },
        { loc: ['body', 'password'], msg: 'second message is ignored', type: 'other' },
        { loc: ['body', 'experiences', 0, 'start_date'], msg: 'Field required', type: 'missing' },
        { loc: ['query', 'page'], msg: 'Input should be greater than 0', type: 'greater_than' },
        { loc: ['body'], msg: 'Field required', type: 'missing' },
      ],
    })

    expect(error.isValidation).toBe(true)
    expect(error.serverMessage).toBeNull()
    expect(error.message).toBe('Alguns campos têm erros. Revê os dados introduzidos.')
    expect(error.fieldErrors).toEqual({
      email: 'Value error, Invalid email address',
      password: 'String should have at least 12 characters',
      'experiences.0.start_date': 'Field required',
      page: 'Input should be greater than 0',
      _root: 'Field required',
    })
    expect(Array.isArray(error.details)).toBe(true)
  })
})

describe('apiErrorFromBody — status messages and unknown bodies', () => {
  it('uses the rate-limit message for 429', () => {
    expect(apiErrorFromBody(429, null).message).toBe(
      'Demasiados pedidos, tenta novamente em instantes.',
    )
  })

  it('falls back to a generic message for 500 and unknown bodies', () => {
    const error = apiErrorFromBody(500, 'Internal Server Error')
    expect(error.message).toBe('Ocorreu um erro inesperado. Tenta novamente.')
    expect(error.serverMessage).toBeNull()
    expect(error.fieldErrors).toEqual({})
  })
})

describe('toFieldErrors', () => {
  it('ignores malformed issues and non-array input', () => {
    expect(toFieldErrors(null)).toEqual({})
    expect(toFieldErrors({ loc: ['body', 'x'], msg: 'nope' })).toEqual({})
    expect(toFieldErrors([{ loc: 'email', msg: 'x' }, { msg: 'x' }, 42])).toEqual({})
  })
})

describe('apiErrorFromResponse', () => {
  it('parses a JSON error response', async () => {
    const error = await apiErrorFromResponse(jsonResponse(403, { detail: 'Insufficient permissions' }))
    expect(error.status).toBe(403)
    expect(error.serverMessage).toBe('Insufficient permissions')
  })

  it('tolerates non-JSON and empty bodies', async () => {
    const html = await apiErrorFromResponse(new Response('<h1>Bad gateway</h1>', { status: 502 }))
    expect(html.status).toBe(502)
    expect(html.serverMessage).toBeNull()

    const empty = await apiErrorFromResponse(new Response(null, { status: 404 }))
    expect(empty.message).toBe('O recurso pedido não foi encontrado.')
  })
})

describe('networkError', () => {
  it('creates a status-0 network ApiError that keeps the cause', () => {
    const cause = new TypeError('Failed to fetch')
    const error = networkError(cause)

    expect(isApiError(error)).toBe(true)
    expect(error.kind).toBe('network')
    expect(error.status).toBe(0)
    expect(error.cause).toBe(cause)
    expect(error.message).toBe('Não foi possível contactar o servidor. Verifica a tua ligação.')
  })
})
