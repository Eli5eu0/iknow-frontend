import { describe, expect, it } from 'vitest'

import { formatLocation, formatPeriod, greetingName, joinFilled, profileSummary } from '@/modules/candidates/profile-display'
import type { CandidateProfile } from '@/modules/candidates/types'

const base: CandidateProfile = {
  id: '00000000-0000-4000-8000-000000000001',
  full_name: null,
  phone: null,
  headline: null,
  summary: null,
  city: null,
  country: null,
  availability: null,
  is_public: true,
  created_at: '2026-11-13T00:00:00Z',
  updated_at: '2026-11-13T00:00:00Z',
}

describe('greetingName', () => {
  it('uses the first name, and null when there is no profile or name', () => {
    expect(greetingName({ ...base, full_name: '  Ana Maria Costa ' })).toBe('Ana')
    expect(greetingName({ ...base, full_name: '   ' })).toBeNull()
    expect(greetingName(base)).toBeNull()
    expect(greetingName(null)).toBeNull()
  })
})

describe('formatLocation', () => {
  it('joins the filled parts', () => {
    expect(formatLocation({ ...base, city: 'Lisboa', country: 'Portugal' })).toBe('Lisboa, Portugal')
    expect(formatLocation({ ...base, country: 'Portugal' })).toBe('Portugal')
    expect(formatLocation({ ...base, city: ' ' })).toBeNull()
  })
})

describe('profileSummary', () => {
  it('marks empty fields as null and maps visibility', () => {
    expect(profileSummary({ ...base, headline: 'Developer', is_public: false })).toEqual([
      { label: 'Título profissional', value: 'Developer' },
      { label: 'Localização', value: null },
      { label: 'Disponibilidade', value: null },
      { label: 'Visibilidade', value: 'Perfil privado' },
    ])
  })
})

describe('formatPeriod', () => {
  it('formats month and year in Portuguese from the ISO string', () => {
    expect(formatPeriod('2020-01-01', null, true)).toBe('jan. de 2020 – actual')
    expect(formatPeriod('2020-01-31', '2022-03-01', false)).toBe('jan. de 2020 – mar. de 2022')
    expect(formatPeriod('2020-01-01', null, false)).toBe('jan. de 2020')
  })
})

describe('joinFilled', () => {
  it('skips empty values', () => {
    expect(joinFilled(['Empresa', null, ' ', 'Lisboa'])).toBe('Empresa · Lisboa')
    expect(joinFilled([null, ''])).toBeNull()
  })
})
