import type { CompanyVerificationStatus } from '@/modules/companies/types'

export type VerificationTone = 'neutral' | 'pending' | 'success' | 'danger'

interface VerificationCopy {
  label: string
  /** Banner text on the company dashboard. */
  description: string
  tone: VerificationTone
}

/**
 * Texts for the verification states (contract D08). Read-only: the backend has no
 * endpoints to submit or decide a verification yet (docs/COMPANIES.md, Pendente),
 * so no text promises an action the user cannot take.
 */
export const verificationCopy: Record<CompanyVerificationStatus, VerificationCopy> = {
  NOT_SUBMITTED: {
    label: 'Verificação não submetida',
    description: 'A publicação de oportunidades fica disponível depois de a empresa ser verificada.',
    tone: 'neutral',
  },
  PENDING: {
    label: 'Verificação em análise',
    description: 'A verificação da empresa está em análise. Podes publicar oportunidades quando for aprovada.',
    tone: 'pending',
  },
  VERIFIED: {
    label: 'Empresa verificada',
    description: 'A empresa está verificada e pode publicar oportunidades.',
    tone: 'success',
  },
  REJECTED: {
    label: 'Verificação recusada',
    description: 'A verificação da empresa foi recusada. Enquanto não for aprovada, não é possível publicar oportunidades.',
    tone: 'danger',
  },
  SUSPENDED: {
    label: 'Empresa suspensa',
    description: 'A empresa está suspensa e não pode publicar oportunidades.',
    tone: 'danger',
  },
}
