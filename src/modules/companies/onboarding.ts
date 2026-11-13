import { z } from 'zod'

import type { Company, CompanyRequiredField, CompanyUpdate } from '@/modules/companies/types'

/*
 * Onboarding steps (D07: profile filled after registration, partial save allowed).
 * Each step is saved with PATCH /companies/me when the user continues, so leaving
 * half-way keeps what was already saved. Limits mirror app/schemas/company.py.
 */

const required = (label: string, max: number) =>
  z.string().trim().min(1, `Indica ${label}.`).max(max, `Tem no máximo ${max} caracteres.`)

export const identityStepSchema = z.object({
  name: required('o nome da empresa', 180),
  legal_name: required('a denominação legal', 220),
  tax_id: required('o número de identificação fiscal', 80),
})

export const aboutStepSchema = z.object({
  description: required('uma descrição da empresa', 5000),
  // Optional; when sent it must start with http:// or https:// (backend rule).
  website: z
    .string()
    .trim()
    .max(255, 'Tem no máximo 255 caracteres.')
    .refine((value) => value === '' || /^https?:\/\//i.test(value), {
      message: 'O endereço tem de começar por http:// ou https://.',
    }),
})

export const locationStepSchema = z.object({
  city: required('a cidade', 100),
  country: required('o país', 100),
})

export const onboardingSteps = [
  {
    id: 'identity',
    title: 'Identificação',
    description: 'Como a empresa é conhecida e os dados legais.',
    fields: ['name', 'legal_name', 'tax_id'],
    schema: identityStepSchema,
  },
  {
    id: 'about',
    title: 'Sobre a empresa',
    description: 'O que a empresa faz e onde a podem encontrar online.',
    fields: ['description', 'website'],
    schema: aboutStepSchema,
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Onde fica a empresa.',
    fields: ['city', 'country'],
    schema: locationStepSchema,
  },
] as const

export type OnboardingStep = (typeof onboardingSteps)[number]
export type OnboardingField = OnboardingStep['fields'][number]

/** First step that still has a missing required field; the last step when none is missing. */
export function firstIncompleteStep(missing: readonly CompanyRequiredField[]): number {
  const index = onboardingSteps.findIndex((step) =>
    step.fields.some((field) => (missing as readonly string[]).includes(field)),
  )
  return index === -1 ? onboardingSteps.length - 1 : index
}

/** Form values for a step, from the saved company (null becomes an empty input). */
export function stepDefaults(step: OnboardingStep, company: Company): Record<string, string> {
  return Object.fromEntries(step.fields.map((field) => [field, company[field] ?? '']))
}

/** PATCH body for a step. An empty website is sent as null (clears it, allowed by the API). */
export function stepPayload(values: Record<string, string>): CompanyUpdate {
  const payload: Record<string, string | null> = {}
  for (const [field, value] of Object.entries(values)) {
    payload[field] = field === 'website' && value.trim() === '' ? null : value.trim()
  }
  return payload as CompanyUpdate
}

export const requiredFieldLabels: Record<CompanyRequiredField, string> = {
  name: 'Nome da empresa',
  legal_name: 'Denominação legal',
  tax_id: 'Número de identificação fiscal',
  description: 'Descrição',
  city: 'Cidade',
  country: 'País',
}
