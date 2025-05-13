import type { z } from 'zod'

/* ─── creator ─────────────────────────────── */

export function createAction<In extends z.ZodRawShape, Out extends z.ZodTypeAny>(opts: {
	schema: { input: z.ZodObject<In>; output: Out }
	execute: (v: z.infer<z.ZodObject<In>>) => Promise<z.infer<Out>>
}) {
	return {
		kind: 'action',
		schema: opts.schema,
		impl: { execute: opts.execute }
	} as const
}

export type ActionManifest = Record<string, ReturnType<typeof createAction>>

/* helper types */
export type ActionNode<M extends ActionManifest, N extends keyof M> = {
	action: N
	params: z.infer<M[N]['schema']['input']>
}

/* ─── executor ────────────────────────────── */

type InputOf<T> = z.infer<T['schema']['input']>
type OutputOf<T> = z.infer<T['schema']['output']>

export function createActionsExecutor<M extends ActionManifest>(m: M) {
	async function run<N extends keyof M>(name: N, raw: InputOf<M[N]>): Promise<OutputOf<M[N]>> {
		const def = m[name]
		const parsed = def.schema.input.parse(raw)
		return def.impl.execute(parsed as any)
	}

	async function executeChain(node: unknown): Promise<unknown> {
		if (node && typeof node === 'object' && 'action' in node) {
			const { action, params } = node as ActionNode<M, keyof M>
			const resolved: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(params)) resolved[k] = await executeChain(v)
			return run(action as any, resolved as any)
		}
		if (Array.isArray(node)) return Promise.all(node.map(executeChain))
		if (node && typeof node === 'object') {
			const out: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(node)) out[k] = await executeChain(v)
			return out
		}
		return node
	}

	return { executeChain } as const
}
