'use client'

import type { ReactNode } from 'react'

export function Hero({ children }: { children: ReactNode }) {
	return <div className="py-12 text-center">{children}</div>
}
