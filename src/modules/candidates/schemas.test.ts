import { describe, expect, it } from 'vitest'

import {
  educationPayload,
  educationSchema,
  experienceDefaults,
  experiencePayload,
  experienceSchema,
  profilePayload,
  skillDetailsDefaults,
  skillDetailsPayload,
  skillDetailsSchema,
  type ExperienceFormValues,
} from '@/modules/candidates/schemas'

const experience: ExperienceFormValues = {
  job_title: 'Programadora',
  company_name: 'Empresa Exemplo',
  employment_type: '',
  city: '',
  country: '',
  description: '',
  start_date: '2022-01-01',
  end_date: '',
  is_current: false,
}

function issuePaths(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return result.error?.issues.map((issue) => [issue.path.join('.'), issue.message]) ?? []
}

describe('profilePayload', () => {
  it('sends every field for PUT, trimmed, with empty ones as null', () => {
    expect(
      profilePayload({
        full_name: '  Ana Costa ',
        headline: '',
        phone: ' ',
        city: 'Lisboa',
        country: '',
        availability: '',
        summary: 'Linha 1\nLinha 2',
      }),
    ).toEqual({
      full_name: 'Ana Costa',
      headline: null,
      phone: null,
      city: 'Lisboa',
      country: null,
      availability: null,
      summary: 'Linha 1\nLinha 2',
    })
  })
})

describe('experienceSchema (backend date rules)', () => {
  it('requires function, company and start date', () => {
    const result = experienceSchema.safeParse({ ...experience, job_title: ' ', company_name: '', start_date: '' })
    expect(issuePaths(result)).toEqual([
      ['job_title', 'Indica a função.'],
      ['company_name', 'Indica a empresa.'],
      ['start_date', 'Indica a data de início.'],
    ])
  })

  it('rejects an end date before the start date', () => {
    const result = experienceSchema.safeParse({ ...experience, end_date: '2021-12-31' })
    expect(issuePaths(result)).toEqual([['end_date', 'A data de fim não pode ser anterior à de início.']])
  })

  it('rejects an end date on a current item', () => {
    const result = experienceSchema.safeParse({ ...experience, is_current: true, end_date: '2023-01-01' })
    expect(issuePaths(result)).toEqual([['end_date', 'Retira a data de fim ou desmarca "actual".']])
  })

  it('accepts the same start and end date', () => {
    expect(experienceSchema.safeParse({ ...experience, end_date: '2022-01-01' }).success).toBe(true)
  })
})

describe('experience / education payloads', () => {
  it('maps empty optional fields to null and never sends an end date when current', () => {
    expect(experiencePayload({ ...experience, is_current: true, end_date: '2023-01-01' })).toEqual({
      job_title: 'Programadora',
      company_name: 'Empresa Exemplo',
      employment_type: null,
      city: null,
      country: null,
      description: null,
      start_date: '2022-01-01',
      end_date: null,
      is_current: true,
    })
  })

  it('turns API nulls into empty inputs for editing', () => {
    const defaults = experienceDefaults({
      id: 'x',
      job_title: 'Programadora',
      company_name: 'Empresa Exemplo',
      employment_type: null,
      description: null,
      city: null,
      country: null,
      start_date: '2022-01-01',
      end_date: null,
      is_current: true,
      created_at: '',
      updated_at: '',
    })
    expect(defaults).toMatchObject({ employment_type: '', end_date: '', is_current: true })
  })

  it('requires the institution for education', () => {
    const result = educationSchema.safeParse({
      institution: '',
      degree: '',
      field_of_study: '',
      city: '',
      country: '',
      description: '',
      start_date: '2020-09-01',
      end_date: '',
      is_current: true,
    })
    expect(issuePaths(result)).toEqual([['institution', 'Indica a instituição.']])
    expect(
      educationPayload({
        institution: ' Universidade ',
        degree: 'Licenciatura',
        field_of_study: '',
        city: '',
        country: '',
        description: '',
        start_date: '2020-09-01',
        end_date: '',
        is_current: true,
      }),
    ).toMatchObject({ institution: 'Universidade', field_of_study: null, end_date: null })
  })
})

describe('skill details', () => {
  it('accepts empty or 0–80 years, with comma or dot', () => {
    for (const value of ['', '0', '2', '2,5', '1.5', '80']) {
      expect(skillDetailsSchema.safeParse({ proficiency: '', years_experience: value }).success).toBe(true)
    }
    for (const value of ['-1', '81', 'abc', '2,5,1']) {
      expect(skillDetailsSchema.safeParse({ proficiency: '', years_experience: value }).success).toBe(false)
    }
  })

  it('only accepts the Proficiency enum', () => {
    expect(skillDetailsSchema.safeParse({ proficiency: 'EXPERT', years_experience: '' }).success).toBe(true)
    expect(skillDetailsSchema.safeParse({ proficiency: 'GURU', years_experience: '' }).success).toBe(false)
  })

  it('builds the payload with nulls for empty values', () => {
    expect(skillDetailsPayload({ proficiency: '', years_experience: '' })).toEqual({
      proficiency: null,
      years_experience: null,
    })
    expect(skillDetailsPayload({ proficiency: 'ADVANCED', years_experience: '2,5' })).toEqual({
      proficiency: 'ADVANCED',
      years_experience: 2.5,
    })
  })

  it('fills the edit form from the API', () => {
    expect(
      skillDetailsDefaults({
        skill: { id: 's', name: 'Python', slug: 'python', category: null },
        proficiency: null,
        years_experience: 3,
      }),
    ).toEqual({ proficiency: '', years_experience: '3' })
  })
})
