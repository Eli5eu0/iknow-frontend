import { httpClient } from '@/shared/api/http-client'
import type { components, operations } from '@/shared/types/generated/api'

export type Skill = components['schemas']['SkillRead']
export type SkillListResponse = components['schemas']['SkillListResponse']
type SkillListQuery = NonNullable<operations['list_skills_api_v1_skills_get']['parameters']['query']>

/** Skills catalogue (read-only, any authenticated role; docs/SKILLS.md). */
export const skillsApi = {
  list: (query: SkillListQuery, signal?: AbortSignal) =>
    httpClient.get<SkillListResponse>('/skills', { query, signal }),
}
