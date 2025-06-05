'use client'

import type { ReactNode } from 'react'

export function Section({ children }: { children: ReactNode }) {
	return <section className="py-4">{children}</section>
}
