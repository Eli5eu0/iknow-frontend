import type { components } from '@/shared/types/generated/api'

type Schemas = components['schemas']

export type CandidateProfile = Schemas['CandidateProfileRead']
export type CandidateProfileUpdate = Schemas['CandidateProfileUpdate']
export type Experience = Schemas['ExperienceRead']
export type ExperienceCreate = Schemas['ExperienceCreate']
export type ExperienceUpdate = Schemas['ExperienceUpdate']
export type Education = Schemas['EducationRead']
export type EducationCreate = Schemas['EducationCreate']
export type EducationUpdate = Schemas['EducationUpdate']
export type CandidateSkill = Schemas['CandidateSkillRead']
export type CandidateSkillCreate = Schemas['CandidateSkillCreate']
export type CandidateSkillUpdate = Schemas['CandidateSkillUpdate']
export type Proficiency = Schemas['Proficiency']
