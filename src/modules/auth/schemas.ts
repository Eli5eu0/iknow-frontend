import { z } from 'zod'

/*
 * Form schemas. Limits mirror the backend (app/schemas/auth.py):
 * email 5–320 chars, register password 12–128, login password 1–128.
 * The backend also lower-cases and trims the email; validation there is authoritative.
 */

const email = z
  .string()
  .trim()
  .min(1, 'Indica o teu email.')
  .max(320, 'O email é demasiado longo.')
  .pipe(z.email('Indica um email válido.'))

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Indica a tua palavra-passe.')
    .max(128, 'A palavra-passe tem no máximo 128 caracteres.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const PASSWORD_MIN_LENGTH = 12

export const registerSchema = z.object({
  role: z.enum(['CANDIDATE', 'COMPANY'], 'Escolhe o tipo de conta.'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `A palavra-passe tem de ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
    .max(128, 'A palavra-passe tem no máximo 128 caracteres.'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
