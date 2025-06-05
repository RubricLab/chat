'use client'

import type { ReactNode } from 'react'

export function Container({ children, maxWidth }: { children: ReactNode; maxWidth: number }) {
	return (
		<div className="mx-auto" style={{ maxWidth: `${maxWidth}px` }}>
			{children}
		</div>
	)
}
