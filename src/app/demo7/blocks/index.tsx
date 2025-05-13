import type { ReactNode } from 'react'
import type { z } from 'zod'

/* ─── creator ─────────────────────────────── */

export function createBlock<In extends z.ZodRawShape, Out extends z.ZodTypeAny>(opts: {
	schema: { input: z.ZodObject<In>; output: Out }
	render: (
		props: z.infer<z.ZodObject<In>>,
		ctx: { emit: (v: z.infer<Out>) => void },
		mapper?: `$${keyof In extends string ? keyof In : never}`
	) => ReactNode
}) {
	return {
		kind: 'block',
		schema: opts.schema,
		impl: { render: opts.render }
	} as const
}

export type BlockManifest = Record<string, ReturnType<typeof createBlock>>

/* ─── renderer ────────────────────────────── */

export function createBlocksRenderer<M extends BlockManifest>(
	manifest: M,
	opts?: { callThunk?: (f: (...a: any[]) => Promise<any>) => any }
) {
	const callThunk = opts?.callThunk ?? ((f: (...a: any[]) => Promise<any>) => f())

	function RenderNode(node: any): ReactNode {
		if (!node || typeof node !== 'object') return null
		if ('block' in node) {
			const def = manifest[node.block as keyof M]
			if (!def) return null
			const resolved: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(node.props ?? {})) {
				if (typeof v === 'function') resolved[k] = (...a: any[]) => callThunk(() => (v as any)(...a))
				else resolved[k] = RenderNode(v) ?? v
			}
			return def.impl.render(resolved as any, { emit: () => {} })
		}
		if (Array.isArray(node)) return node.map(RenderNode)
		return node
	}

	const RenderChain: React.FC<{ chain: unknown }> = ({ chain }) => <>{RenderNode(chain)}</>

	return { RenderChain } as const
}
