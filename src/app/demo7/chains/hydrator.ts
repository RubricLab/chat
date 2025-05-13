import { z } from 'zod'
import type { Transformer } from './transformers'

export function createHydrator<Man extends Record<string, Transformer<any, any, any>>>(
	manifest: Man,
	executor: { executeChain(node: unknown): Promise<unknown> }
) {
	const shapeCache: Record<string, z.AnyZodObject> = {}
	const shapeOf = (block: string) => (shapeCache[block] ??= manifest[block].schema.input)

	async function hydrate(node: unknown, parent?: string, key?: string): Promise<unknown> {
		if (!node || typeof node !== 'object') return node

		/* Action */
		if ('action' in node) {
			const eager =
				!parent ||
				!key ||
				shapeOf(parent).shape[key]?._def.typeName !== z.ZodFirstPartyTypeKind.ZodFunction
			if (eager) return executor.executeChain(node)
			return async (...args: unknown[]) =>
				executor.executeChain({ ...(node as any), params: { ...(node as any).params, args } })
		}

		/* Block */
		if ('block' in node) {
			const { block, props } = node as { block: string; props: Record<string, unknown> }
			const out: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(props)) out[k] = await hydrate(v, block, k)
			return { block, props: out }
		}

		/* Containers */
		if (Array.isArray(node)) return Promise.all(node.map(v => hydrate(v, parent, key)))
		const out: Record<string, unknown> = {}
		for (const [k, v] of Object.entries(node)) out[k] = await hydrate(v, parent, k)
		return out
	}

	return { hydrate } as const
}
