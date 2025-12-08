import { type ReactNode, useState } from 'react'

interface DropdownProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}

export function Dropdown({ title, children, defaultOpen = false }: DropdownProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<div>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="button-secondary flex w-full items-center justify-between gap-2 rounded-default px-3 py-2 text-left font-medium text-sm"
			>
				<span>{title}</span>
				<span> {isOpen ? '▼' : '▶'}</span>
			</button>
			{isOpen && <div className="mt-2">{children}</div>}
		</div>
	)
}
