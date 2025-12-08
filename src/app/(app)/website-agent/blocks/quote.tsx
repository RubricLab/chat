'use client'

export function Quote({ text }: { text: string }) {
	return <blockquote className="border-border border-l-2 pl-4 text-sm">{text}</blockquote>
}
