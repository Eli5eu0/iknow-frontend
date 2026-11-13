import { Link } from 'react-router-dom'

import { cn } from '@/shared/utils/cn'

interface LogoProps {
  to: string
  className?: string
}

/** Placeholder brand mark ("[□] iKnow", wireframe 1) until the final logo exists. */
export function Logo({ to, className }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md text-lg font-bold tracking-tight text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
        className,
      )}
    >
      <span
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
        aria-hidden="true"
      >
        i
      </span>
      iKnow
    </Link>
  )
}
