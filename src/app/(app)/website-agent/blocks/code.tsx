'use client'

export function Code({ code }: { code: string }) {
	return <pre className="surface rounded border border-border p-2 font-mono text-sm">{code}</pre>
}
