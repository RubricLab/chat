'use client'

import type { ReactNode } from 'react'

export function Footer({ children }: { children: ReactNode }) {
	return <footer className="py-4">{children}</footer>
}
