import { isApiError } from '@/shared/api/errors'
import { httpClient } from '@/shared/api/http-client'
import type {
  CandidateProfile,
  CandidateProfileUpdate,
  CandidateSkill,
  CandidateSkillCreate,
  CandidateSkillUpdate,
  Education,
  EducationCreate,
  EducationUpdate,
  Experience,
  ExperienceCreate,
  ExperienceUpdate,
} from '@/modules/candidates/types'

/**
 * The read endpoints answer 404 while the candidate has no profile yet (docs/CANDIDATES.md):
 * for the lists that simply means "nothing added yet".
 */
async function emptyWhenNoProfile<T>(request: Promise<T[]>): Promise<T[]> {
  try {
    return await request
  } catch (error) {
    if (isApiError(error) && error.kind === 'http' && error.status === 404) return []
    throw error
  }
}

/** Candidate endpoints (OpenAPI: /api/v1/candidates/*). */
export const candidatesApi = {
  /** 404 "Candidate profile not found" until the profile is created. */
  getMe: (signal?: AbortSignal) => httpClient.get<CandidateProfile>('/candidates/me', { signal }),

  /** Creates or updates the profile (PATCH would 404 before the profile exists). */
  putMe: (payload: CandidateProfileUpdate) => httpClient.put<CandidateProfile>('/candidates/me', payload),

  /** Also creates the profile when missing. */
  setVisibility: (isPublic: boolean) =>
    httpClient.patch<CandidateProfile>('/candidates/me/visibility', { is_public: isPublic }),

  listExperiences: (signal?: AbortSignal) =>
    emptyWhenNoProfile(httpClient.get<Experience[]>('/candidates/me/experiences', { signal })),
  createExperience: (payload: ExperienceCreate) =>
    httpClient.post<Experience>('/candidates/me/experiences', payload),
  updateExperience: (id: string, payload: ExperienceUpdate) =>
    httpClient.patch<Experience>(`/candidates/me/experiences/${encodeURIComponent(id)}`, payload),
  deleteExperience: (id: string) =>
    httpClient.delete<void>(`/candidates/me/experiences/${encodeURIComponent(id)}`),

  listEducations: (signal?: AbortSignal) =>
    emptyWhenNoProfile(httpClient.get<Education[]>('/candidates/me/educations', { signal })),
  createEducation: (payload: EducationCreate) =>
    httpClient.post<Education>('/candidates/me/educations', payload),
  updateEducation: (id: string, payload: EducationUpdate) =>
    httpClient.patch<Education>(`/candidates/me/educations/${encodeURIComponent(id)}`, payload),
  deleteEducation: (id: string) =>
    httpClient.delete<void>(`/candidates/me/educations/${encodeURIComponent(id)}`),

  listSkills: (signal?: AbortSignal) =>
    emptyWhenNoProfile(httpClient.get<CandidateSkill[]>('/candidates/me/skills', { signal })),
  addSkill: (payload: CandidateSkillCreate) =>
    httpClient.post<CandidateSkill>('/candidates/me/skills', payload),
  updateSkill: (skillId: string, payload: CandidateSkillUpdate) =>
    httpClient.patch<CandidateSkill>(`/candidates/me/skills/${encodeURIComponent(skillId)}`, payload),
  removeSkill: (skillId: string) =>
    httpClient.delete<void>(`/candidates/me/skills/${encodeURIComponent(skillId)}`),
}
