import { httpClient } from '@/shared/api/http-client'
import type { Company, CompanyUpdate } from '@/modules/companies/types'

/** Company endpoints (OpenAPI: /api/v1/companies/*, docs/COMPANIES.md). */
export const companiesApi = {
  /** The company of the signed-in COMPANY account (created empty at registration). */
  getMe: (signal?: AbortSignal) => httpClient.get<Company>('/companies/me', { signal }),

  /** Partial update: only the fields sent change. Blank required fields are 422. */
  updateMe: (payload: CompanyUpdate) => httpClient.patch<Company>('/companies/me', payload),
}
