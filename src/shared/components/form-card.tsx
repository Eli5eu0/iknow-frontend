import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils/cn'

interface FormCardProps {
  title: string
  description?: ReactNode
  children: ReactNode
  /** Bottom area (wireframe 2's three small buttons): secondary links or step indicator. */
  footer?: ReactNode
  className?: string
}

/** Card that holds a form in the split layout (CLAUDE.md §4.2). Renders the page's <h1>. */
export function FormCard({ title, description, children, footer, className }: FormCardProps) {
  return (
    <Card className={cn('gap-6 shadow-sm', className)}>
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <div className="border-t border-border px-6 pt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </Card>
  )
}
