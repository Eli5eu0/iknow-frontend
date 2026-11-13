import { EducationSection } from '@/modules/candidates/components/education-section'
import { ExperienceSection } from '@/modules/candidates/components/experience-section'
import { PersonalDataSection } from '@/modules/candidates/components/personal-data-section'
import { SkillsSection } from '@/modules/candidates/components/skills-section'
import { VisibilitySwitch } from '@/modules/candidates/components/visibility-switch'
import { useMyCandidateProfile } from '@/modules/candidates/hooks/use-my-candidate-profile'
import { ErrorState } from '@/shared/components/error-state'
import { LoadingState } from '@/shared/components/loading-state'
import { PageHeader } from '@/shared/components/page-header'

/**
 * /perfil (CLAUDE.md §5.2): personal data, skills, experience and education, each section
 * loading and saving on its own (/candidates/me*, GET /skills). The profile is created by
 * the first write (PUT /candidates/me or adding any item).
 */
export function CandidateProfilePage() {
  const { state, reload, setData } = useMyCandidateProfile()
  const profile = state.status === 'success' ? state.data : null

  /** After the first write the profile exists: load it so the page reflects it. */
  function handleItemChanged() {
    if (state.status === 'success' && state.data === null) reload()
  }

  return (
    <>
      <PageHeader
        title="O meu perfil"
        description="Estes dados são usados nas recomendações e no teu perfil público."
        actions={
          state.status === 'success' ? (
            // Profiles are public by default, also before they exist (docs/CANDIDATES.md).
            <VisibilitySwitch isPublic={profile?.is_public ?? true} onSaved={setData} />
          ) : null
        }
      />

      <div className="space-y-12">
        {state.status === 'loading' ? <LoadingState variant="list" count={1} label="A carregar o perfil…" /> : null}
        {state.status === 'error' ? (
          <div className="rounded-xl border border-border bg-card">
            <ErrorState title="Não foi possível carregar os teus dados" error={state.error} onRetry={reload} />
          </div>
        ) : null}
        {state.status === 'success' ? <PersonalDataSection profile={profile} onSaved={setData} /> : null}

        <SkillsSection onChanged={handleItemChanged} />
        <ExperienceSection onChanged={handleItemChanged} />
        <EducationSection onChanged={handleItemChanged} />
      </div>
    </>
  )
}
