'use client'

import type { ReactNode } from 'react'

export function Stack({ children, spacing }: { children: ReactNode; spacing: number }) {
	return <div className={`space-y-${spacing}`}>{children}</div>
}
