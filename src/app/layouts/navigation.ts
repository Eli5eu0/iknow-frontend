import { Bell, Briefcase, Building2, FileText, LayoutDashboard, UserRound } from 'lucide-react'

import { paths } from '@/app/router/paths'
import type { UserRole } from '@/modules/auth/types'
import type { SidebarNavItem } from '@/shared/components/sidebar'

/**
 * Sidebar navigation per role, from the page map in CLAUDE.md §5.2 and §5.3.
 * "Conta" lives in the profile menu, not here. Onboarding and detail/edit pages are
 * reached through the flow, not the menu. Admin has no endpoints (§5.4), so no entry.
 */
const candidateNavigation: readonly SidebarNavItem[] = [
  { label: 'Painel', to: paths.candidateHome, icon: LayoutDashboard, end: true },
  { label: 'Oportunidades', to: paths.opportunities, icon: Briefcase },
  { label: 'Candidaturas', to: paths.applications, icon: FileText },
  { label: 'Perfil', to: paths.candidateProfile, icon: UserRound },
  { label: 'Notificações', to: paths.notifications, icon: Bell },
]

const companyNavigation: readonly SidebarNavItem[] = [
  { label: 'Painel', to: paths.companyHome, icon: LayoutDashboard, end: true },
  { label: 'Oportunidades', to: paths.companyOpportunities, icon: Briefcase },
  { label: 'Candidaturas', to: paths.companyApplications, icon: FileText },
  { label: 'Perfil da empresa', to: paths.companyProfile, icon: Building2 },
  { label: 'Notificações', to: paths.notifications, icon: Bell },
]

export function navigationFor(role: UserRole): readonly SidebarNavItem[] {
  switch (role) {
    case 'CANDIDATE':
      return candidateNavigation
    case 'COMPANY':
      return companyNavigation
  }
}

export const roleLabels: Record<UserRole, string> = {
  CANDIDATE: 'Candidato',
  COMPANY: 'Empresa',
}
