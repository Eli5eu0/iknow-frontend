import { z } from 'zod'

import type {
  CandidateProfile,
  CandidateProfileUpdate,
  CandidateSkill,
  CandidateSkillUpdate,
  Education,
  EducationCreate,
  Experience,
  ExperienceCreate,
  Proficiency,
} from '@/modules/candidates/types'

/*
 * Form schemas for the candidate profile. Limits and rules mirror app/schemas/candidate.py;
 * the backend stays authoritative. Inputs are strings; payload builders convert empty
 * optional fields to null.
 */

const optionalText = (max: number) => z.string().trim().max(max, `Tem no máximo ${max} caracteres.`)
const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Tem no máximo ${max} caracteres.`)
const isoDate = /^\d{4}-\d{2}-\d{2}$/

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

// --- Personal data -------------------------------------------------------------------

export const profileSchema = z.object({
  full_name: optionalText(160),
  headline: optionalText(180),
  phone: optionalText(32),
  city: optionalText(100),
  country: optionalText(100),
  availability: optionalText(255),
  summary: optionalText(5000),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export function profileDefaults(profile: CandidateProfile | null): ProfileFormValues {
  return {
    full_name: profile?.full_name ?? '',
    headline: profile?.headline ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    availability: profile?.availability ?? '',
    summary: profile?.summary ?? '',
  }
}

/** Full PUT body: every field is sent, empty ones as null (clears them). */
export function profilePayload(values: ProfileFormValues): CandidateProfileUpdate {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, nullIfEmpty(value)]),
  ) as CandidateProfileUpdate
}

// --- Dates shared by experience and education -----------------------------------------

const periodFields = {
  start_date: z.string().regex(isoDate, 'Indica a data de início.'),
  end_date: z.string().refine((value) => value === '' || isoDate.test(value), 'Data inválida.'),
  is_current: z.boolean(),
}

type Period = { start_date: string; end_date: string; is_current: boolean }

/** Backend rules: end date not before start date; a current item has no end date. */
function checkPeriod(values: Period, ctx: z.RefinementCtx) {
  if (values.is_current && values.end_date !== '') {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'Retira a data de fim ou desmarca "actual".' })
  }
  if (values.end_date !== '' && values.end_date < values.start_date) {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'A data de fim não pode ser anterior à de início.' })
  }
}

// --- Experience -------------------------------------------------------------------------

export const experienceSchema = z
  .object({
    job_title: requiredText(180, 'Indica a função.'),
    company_name: requiredText(180, 'Indica a empresa.'),
    employment_type: optionalText(40),
    city: optionalText(100),
    country: optionalText(100),
    description: optionalText(5000),
    ...periodFields,
  })
  .superRefine(checkPeriod)

export type ExperienceFormValues = z.infer<typeof experienceSchema>

export function experienceDefaults(record: Experience | null): ExperienceFormValues {
  return {
    job_title: record?.job_title ?? '',
    company_name: record?.company_name ?? '',
    employment_type: record?.employment_type ?? '',
    city: record?.city ?? '',
    country: record?.country ?? '',
    description: record?.description ?? '',
    start_date: record?.start_date ?? '',
    end_date: record?.end_date ?? '',
    is_current: record?.is_current ?? false,
  }
}

/** Body for POST and for PATCH (all fields sent, so cleared fields become null). */
export function experiencePayload(values: ExperienceFormValues): ExperienceCreate {
  return {
    job_title: values.job_title.trim(),
    company_name: values.company_name.trim(),
    employment_type: nullIfEmpty(values.employment_type),
    city: nullIfEmpty(values.city),
    country: nullIfEmpty(values.country),
    description: nullIfEmpty(values.description),
    start_date: values.start_date,
    end_date: values.is_current ? null : nullIfEmpty(values.end_date),
    is_current: values.is_current,
  }
}

// --- Education --------------------------------------------------------------------------

export const educationSchema = z
  .object({
    institution: requiredText(180, 'Indica a instituição.'),
    degree: optionalText(120),
    field_of_study: optionalText(160),
    city: optionalText(100),
    country: optionalText(100),
    description: optionalText(5000),
    ...periodFields,
  })
  .superRefine(checkPeriod)

export type EducationFormValues = z.infer<typeof educationSchema>

export function educationDefaults(record: Education | null): EducationFormValues {
  return {
    institution: record?.institution ?? '',
    degree: record?.degree ?? '',
    field_of_study: record?.field_of_study ?? '',
    city: record?.city ?? '',
    country: record?.country ?? '',
    description: record?.description ?? '',
    start_date: record?.start_date ?? '',
    end_date: record?.end_date ?? '',
    is_current: record?.is_current ?? false,
  }
}

export function educationPayload(values: EducationFormValues): EducationCreate {
  return {
    institution: values.institution.trim(),
    degree: nullIfEmpty(values.degree),
    field_of_study: nullIfEmpty(values.field_of_study),
    city: nullIfEmpty(values.city),
    country: nullIfEmpty(values.country),
    description: nullIfEmpty(values.description),
    start_date: values.start_date,
    end_date: values.is_current ? null : nullIfEmpty(values.end_date),
    is_current: values.is_current,
  }
}

// --- Skills -----------------------------------------------------------------------------

export const proficiencyValues = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const satisfies readonly Proficiency[]

export const proficiencyLabels: Record<Proficiency, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermédio',
  ADVANCED: 'Avançado',
  EXPERT: 'Especialista',
}

export const skillDetailsSchema = z.object({
  proficiency: z.union([z.literal(''), z.enum(proficiencyValues)]),
  years_experience: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+([.,]\d+)?$/.test(value) && Number(value.replace(',', '.')) <= 80), {
      message: 'Indica um número entre 0 e 80.',
    }),
})

export type SkillDetailsFormValues = z.infer<typeof skillDetailsSchema>

export function skillDetailsDefaults(skill: CandidateSkill | null): SkillDetailsFormValues {
  return {
    proficiency: skill?.proficiency ?? '',
    years_experience: skill?.years_experience == null ? '' : String(skill.years_experience).replace('.', ','),
  }
}

export function skillDetailsPayload(values: SkillDetailsFormValues): Required<CandidateSkillUpdate> {
  return {
    proficiency: values.proficiency === '' ? null : values.proficiency,
    years_experience: values.years_experience === '' ? null : Number(values.years_experience.replace(',', '.')),
  }
}
