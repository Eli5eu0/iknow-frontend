import type { components } from '@/shared/types/generated/api'

export type Company = components['schemas']['CompanyRead']
export type CompanyUpdate = components['schemas']['CompanyUpdate']
export type CompanyVerificationStatus = components['schemas']['CompanyVerificationStatus']
/** Required profile fields, as listed in CompanyRead.missing_fields. */
export type CompanyRequiredField = Company['missing_fields'][number]
