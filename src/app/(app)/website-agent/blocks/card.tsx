'use client'

import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
	return <div className="surface rounded-lg p-4">{children}</div>
}
