import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-12 w-full rounded-lg border border-input bg-background/60 px-3.5 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

export function SectionCard({
  icon: Icon,
  step,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon
  step: number
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const headingId = `section-${step}`
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-xl border border-border bg-card p-4 sm:p-6', className)}
    >
      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {'Paso '}
            {String(step).padStart(2, '0')}
          </p>
          <h2 id={headingId} className="text-lg font-semibold text-balance">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  )
}

export function Field({
  id,
  label,
  required,
  children,
  className,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-secondary-foreground">
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
