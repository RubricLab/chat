'use client'

export function Heading({ text, level }: { text: string; level: number }) {
	// Dynamic text size based on level
	const getFontSize = (level: number) => {
		if (level <= 1) return 'text-3xl'
		if (level === 2) return 'text-2xl'
		if (level === 3) return 'text-xl'
		if (level === 4) return 'text-lg'
		if (level === 5) return 'text-base'
		return 'text-sm'
	}

	const className = `font-medium ${getFontSize(level)}`

	// Cap level between 1-6 for valid HTML headings
	const validLevel = Math.max(1, Math.min(6, level))

	switch (validLevel) {
		case 1:
			return <h1 className={className}>{text}</h1>
		case 2:
			return <h2 className={className}>{text}</h2>
		case 3:
			return <h3 className={className}>{text}</h3>
		case 4:
			return <h4 className={className}>{text}</h4>
		case 5:
			return <h5 className={className}>{text}</h5>
		default:
			return <h6 className={className}>{text}</h6>
	}
}
