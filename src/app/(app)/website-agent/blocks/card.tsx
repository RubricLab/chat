'use client'

import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
	return <div className="surface rounded-default p-4">{children}</div>
}
