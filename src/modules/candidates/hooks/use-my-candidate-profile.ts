import { isApiError } from '@/shared/api/errors'
import { useApiResource } from '@/shared/hooks/use-api-resource'
import { candidatesApi } from '@/modules/candidates/api'
import type { CandidateProfile } from '@/modules/candidates/types'

/**
 * GET /candidates/me. Resolves to null on 404: the profile is created on first save
 * (docs/CANDIDATES.md), so "no profile yet" is a normal state, not an error.
 */
export function useMyCandidateProfile() {
  return useApiResource<CandidateProfile | null>(async (signal) => {
    try {
      return await candidatesApi.getMe(signal)
    } catch (error) {
      if (isApiError(error) && error.kind === 'http' && error.status === 404) return null
      throw error
    }
  })
}
