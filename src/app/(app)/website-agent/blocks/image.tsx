'use client'

export function Image({ src, alt }: { src: string; alt: string }) {
	// biome-ignore lint/performance/noImgElement: no need
	return <img src={src} alt={alt} className="rounded border border-border" />
}
