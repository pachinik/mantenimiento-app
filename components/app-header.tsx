'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { History, Plus, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Nueva orden', icon: Plus },
  { href: '/historial', label: 'Historial', icon: History },
]

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <div className="hidden sm:block">
              <p className="font-semibold leading-tight">Solucion-Lab</p>
              <p className="text-xs text-muted-foreground">Soporte Técnico</p>
            </div>
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                    active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        {children && <div className="hidden text-right sm:block">{children}</div>}
      </div>
    </header>
  )
}
