'use client'

export function Quote({ text }: { text: string }) {
	return <blockquote className="border-left-accent pl-4 text-sm">{text}</blockquote>
}
