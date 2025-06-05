'use client'

export function Image({ src, alt }: { src: string; alt: string }) {
	return <img src={src} alt={alt} className="rounded border-subtle" />
}
