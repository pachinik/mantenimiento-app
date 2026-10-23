'use client'

import { useSyncExternalStore } from 'react'
import { formatDateTime } from '@/lib/format'

const subscribe = () => () => {}

export function DateTime({ value, className }: { value: string | null; className?: string }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false)
  return (
    <time dateTime={value ?? undefined} className={className}>
      {isClient ? formatDateTime(value) : '--/--/---- --:--'}
    </time>
  )
}
