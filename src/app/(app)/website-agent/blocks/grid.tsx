'use client'

import type { ReactNode } from 'react'

export function Grid({ children, columns }: { children: ReactNode; columns: number }) {
	return <div className={`grid grid-cols-${columns} gap-4`}>{children}</div>
}
