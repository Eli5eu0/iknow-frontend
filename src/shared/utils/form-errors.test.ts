import { describe, expect, it, vi } from 'vitest'

import { apiErrorFromBody, networkError } from '@/shared/api/errors'
import { applyServerErrors, SERVER_FIELD_ERROR } from '@/shared/utils/form-errors'

type Values = { email: string; password: string }

describe('applyServerErrors', () => {
  it('puts 422 issues next to known fields and returns no form message', () => {
    const setError = vi.fn()
    const error = apiErrorFromBody(422, {
      detail: [{ loc: ['body', 'email'], msg: 'Value error, Invalid email address', type: 'value_error' }],
    })

    const message = applyServerErrors<Values>(error, setError, ['email', 'password'])

    expect(message).toBeNull()
    expect(setError).toHaveBeenCalledExactlyOnceWith('email', {
      type: 'server',
      message: SERVER_FIELD_ERROR,
    })
  })

  it('also returns the form message when some issues have no matching field', () => {
    const setError = vi.fn()
    const error = apiErrorFromBody(422, {
      detail: [
        { loc: ['body', 'email'], msg: 'bad', type: 'value_error' },
        { loc: ['body'], msg: 'Field required', type: 'missing' },
      ],
    })

    expect(applyServerErrors<Values>(error, setError, ['email', 'password'])).toBe(
      'Alguns campos têm erros. Revê os dados introduzidos.',
    )
    expect(setError).toHaveBeenCalledTimes(1)
  })

  it('returns the Portuguese message for non-validation errors', () => {
    const setError = vi.fn()
    expect(applyServerErrors<Values>(apiErrorFromBody(429, null), setError, ['email'])).toBe(
      'Demasiados pedidos, tenta novamente em instantes.',
    )
    expect(applyServerErrors<Values>(networkError(new TypeError('x')), setError, ['email'])).toBe(
      'Não foi possível contactar o servidor. Verifica a tua ligação.',
    )
    expect(setError).not.toHaveBeenCalled()
  })

  it('never exposes unknown errors', () => {
    expect(applyServerErrors<Values>(new Error('stack trace'), vi.fn(), ['email'])).toBe(
      'Ocorreu um erro inesperado. Tenta novamente.',
    )
  })
})
