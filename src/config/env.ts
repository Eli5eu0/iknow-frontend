import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Variáveis de ambiente inválidas: ${z.prettifyError(parsed.error)}. Consulta o .env.example.`,
  )
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
} as const
