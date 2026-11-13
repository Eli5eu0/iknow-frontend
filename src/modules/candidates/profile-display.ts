import type { CandidateProfile } from '@/modules/candidates/types'
import type { DetailItem } from '@/shared/components/detail-list'

/** Text that is blank after trimming counts as not filled in. */
function filled(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** First name for the greeting, or null when the profile has no name. */
export function greetingName(profile: CandidateProfile | null): string | null {
  const name = filled(profile?.full_name)
  return name ? (name.split(/\s+/)[0] ?? null) : null
}

/** "Lisboa, Portugal", "Lisboa" or null. */
export function formatLocation(profile: CandidateProfile): string | null {
  const parts = [filled(profile.city), filled(profile.country)].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

/** Profile fields shown on the dashboard; null values render as "Por preencher". */
export function profileSummary(profile: CandidateProfile): DetailItem[] {
  return [
    { label: 'Título profissional', value: filled(profile.headline) },
    { label: 'Localização', value: formatLocation(profile) },
    { label: 'Disponibilidade', value: filled(profile.availability) },
    { label: 'Visibilidade', value: profile.is_public ? 'Perfil público' : 'Perfil privado' },
  ]
}

// Fixed names: Intl's pt-PT month/year output differs between engines (e.g. "01/2020").
const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

/** "2020-01-31" → "jan. de 2020", read from the string itself (no time-zone shift). */
function monthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value)
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined
  return match && month ? `${month} de ${match[1]}` : value
}

/** "jan. de 2020 – actual", "jan. de 2020 – mar. de 2022" or just the start. */
export function formatPeriod(start: string, end: string | null | undefined, isCurrent: boolean): string {
  const from = monthYear(start)
  if (isCurrent) return `${from} – actual`
  return end ? `${from} – ${monthYear(end)}` : from
}

/** Joins the filled values with " · " (e.g. company, type and place of an experience). */
export function joinFilled(values: readonly (string | null | undefined)[]): string | null {
  const parts = values.map(filled).filter((value): value is string => value !== null)
  return parts.length > 0 ? parts.join(' · ') : null
}
