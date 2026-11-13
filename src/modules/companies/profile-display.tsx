import { verificationCopy, type VerificationTone } from '@/modules/companies/verification'
import type { Company } from '@/modules/companies/types'
import type { DetailItem } from '@/shared/components/detail-list'
import { Badge } from '@/shared/components/ui/badge'

const badgeVariant: Record<VerificationTone, 'secondary' | 'default' | 'success' | 'destructive'> = {
  neutral: 'secondary',
  pending: 'default',
  success: 'success',
  danger: 'destructive',
}

function filled(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Profile fields on the company dashboard; empty values render as "Por preencher". */
export function companySummary(company: Company): DetailItem[] {
  const location = [filled(company.city), filled(company.country)].filter(Boolean).join(', ') || null
  // The backend only accepts http(s) URLs; checked again before rendering a link.
  const rawWebsite = filled(company.website)
  const website = rawWebsite && /^https?:\/\//i.test(rawWebsite) ? rawWebsite : null
  const verification = verificationCopy[company.verification_status]

  return [
    { label: 'Nome da empresa', value: filled(company.name) },
    { label: 'Denominação legal', value: filled(company.legal_name) },
    { label: 'Número de identificação fiscal', value: filled(company.tax_id) },
    { label: 'Localização', value: location },
    {
      label: 'Website',
      value: website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm underline decoration-primary decoration-2 underline-offset-4 hover:decoration-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {website}
        </a>
      ) : null,
    },
    {
      label: 'Verificação',
      value: <Badge variant={badgeVariant[verification.tone]}>{verification.label}</Badge>,
    },
    { label: 'Descrição', value: filled(company.description), wide: true },
  ]
}
