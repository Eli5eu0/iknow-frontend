import { describe, expect, it } from 'vitest'

import { loginSchema, registerSchema } from '@/modules/auth/schemas'

function firstIssue(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return result.error?.issues[0]
}

describe('loginSchema', () => {
  it('trims the email and accepts any non-empty password', () => {
    const result = loginSchema.safeParse({ email: '  ana@example.com ', password: 'x' })
    expect(result.success).toBe(true)
    expect(result.data?.email).toBe('ana@example.com')
  })

  it('asks for the email and the password when they are empty', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => [issue.path[0], issue.message])
    expect(messages).toEqual([
      ['email', 'Indica o teu email.'],
      ['password', 'Indica a tua palavra-passe.'],
    ])
  })

  it('rejects an invalid email', () => {
    const issue = firstIssue(loginSchema.safeParse({ email: 'ana@', password: 'x' }))
    expect(issue).toMatchObject({ path: ['email'], message: 'Indica um email válido.' })
  })
})

describe('registerSchema', () => {
  const valid = { role: 'CANDIDATE', email: 'ana@example.com', password: 'a'.repeat(12) }

  it('accepts the payload expected by POST /auth/register', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
    expect(registerSchema.safeParse({ ...valid, role: 'COMPANY' }).success).toBe(true)
  })

  it('requires a role from the UserRole enum', () => {
    expect(firstIssue(registerSchema.safeParse({ ...valid, role: undefined }))).toMatchObject({
      path: ['role'],
      message: 'Escolhe o tipo de conta.',
    })
    expect(registerSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(false)
  })

  it('enforces the backend password length (12–128)', () => {
    expect(firstIssue(registerSchema.safeParse({ ...valid, password: 'a'.repeat(11) }))).toMatchObject({
      path: ['password'],
      message: 'A palavra-passe tem de ter pelo menos 12 caracteres.',
    })
    expect(registerSchema.safeParse({ ...valid, password: 'a'.repeat(128) }).success).toBe(true)
    expect(registerSchema.safeParse({ ...valid, password: 'a'.repeat(129) }).success).toBe(false)
  })
})
