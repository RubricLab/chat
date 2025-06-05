'use client'

export function Link({ href, text }: { href: string; text: string }) {
	return (
		<a href={href} className="text-sm underline">
			{text}
		</a>
	)
}
