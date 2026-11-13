import type { UserRole } from '@/modules/auth/types'

/**
 * Route paths. Names follow CLAUDE.md §5 and are still [PROPOSTA] until approved;
 * keep them here so a rename touches one file.
 */
export const paths = {
  login: '/entrar',
  register: '/registar',

  candidateHome: '/painel',
  opportunities: '/oportunidades',
  applications: '/candidaturas',
  candidateProfile: '/perfil',

  companyHome: '/empresa/painel',
  companyOnboarding: '/empresa/onboarding',
  companyOpportunities: '/empresa/oportunidades',
  companyApplications: '/empresa/candidaturas',
  companyProfile: '/empresa/perfil',

  // Shared by both roles.
  notifications: '/notificacoes',
  account: '/conta',
} as const

export function homePathFor(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE':
      return paths.candidateHome
    case 'COMPANY':
      return paths.companyHome
  }
}

/** Login URL that returns the user to `target` after signing in. */
export function loginPathWithNext(target: string): string {
  return `${paths.login}?next=${encodeURIComponent(target)}`
}

/**
 * Accepts only same-origin relative paths for `?next=`, preventing open redirects
 * such as `//evil.example`, `/\evil.example` or `https://evil.example`.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return null
  }
  return next
}
