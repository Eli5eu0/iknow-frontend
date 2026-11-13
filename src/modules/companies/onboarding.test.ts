import { describe, expect, it } from 'vitest'

import {
  aboutStepSchema,
  firstIncompleteStep,
  identityStepSchema,
  onboardingSteps,
  stepDefaults,
  stepPayload,
} from '@/modules/companies/onboarding'
import type { Company } from '@/modules/companies/types'

const emptyCompany: Company = {
  id: '00000000-0000-4000-8000-000000000001',
  name: null,
  legal_name: null,
  tax_id: null,
  description: null,
  website: null,
  city: null,
  country: null,
  verification_status: 'NOT_SUBMITTED',
  profile_completed: false,
  missing_fields: ['name', 'legal_name', 'tax_id', 'description', 'city', 'country'],
  created_at: '2026-11-13T00:00:00Z',
  updated_at: '2026-11-13T00:00:00Z',
}

describe('onboarding steps', () => {
  it('cover every required field of CompanyRead.missing_fields exactly once', () => {
    const fields = onboardingSteps.flatMap((step) => step.fields).filter((field) => field !== 'website')
    expect([...fields].sort()).toEqual([...emptyCompany.missing_fields].sort())
  })
})

describe('firstIncompleteStep', () => {
  it('starts at the first step that has a missing field', () => {
    expect(firstIncompleteStep(emptyCompany.missing_fields)).toBe(0)
    expect(firstIncompleteStep(['description', 'city'])).toBe(1)
    expect(firstIncompleteStep(['country'])).toBe(2)
  })

  it('opens the last step when nothing is missing (editing a complete profile)', () => {
    expect(firstIncompleteStep([])).toBe(onboardingSteps.length - 1)
  })
})

describe('stepDefaults / stepPayload', () => {
  it('turns null into empty inputs', () => {
    expect(stepDefaults(onboardingSteps[0], { ...emptyCompany, name: 'Acme' })).toEqual({
      name: 'Acme',
      legal_name: '',
      tax_id: '',
    })
  })

  it('trims values and sends an empty website as null', () => {
    expect(stepPayload({ description: '  Fazemos software. ', website: '  ' })).toEqual({
      description: 'Fazemos software.',
      website: null,
    })
  })
})

describe('step schemas', () => {
  it('require the identity fields', () => {
    const result = identityStepSchema.safeParse({ name: ' ', legal_name: 'Acme, Lda.', tax_id: '123' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({ path: ['name'], message: 'Indica o nome da empresa.' })
  })

  it('accept an empty website and require http(s) otherwise', () => {
    expect(aboutStepSchema.safeParse({ description: 'x', website: '' }).success).toBe(true)
    expect(aboutStepSchema.safeParse({ description: 'x', website: 'https://acme.test' }).success).toBe(true)
    expect(aboutStepSchema.safeParse({ description: 'x', website: 'acme.test' }).error?.issues[0]?.message).toBe(
      'O endereço tem de começar por http:// ou https://.',
    )
  })
})
