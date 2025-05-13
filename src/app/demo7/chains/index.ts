import { buildSchemas } from './builder'
import { createHydrator } from './hydrator'
import type { Transformer } from './transformers'

export type TransformerManifest = Record<string, Transformer<any, any, any>>

/* compile‑time */
export function createChainSchema<M extends TransformerManifest>(manifest: M) {
	const { zodSchema, jsonSchema } = buildSchemas(manifest)
	const $parseRaw = (raw: string) => zodSchema.parse(JSON.parse(raw))
	return {
		zodSchema,
		jsonSchema,
		$parseRaw,
		response_format: {
			type: 'json_schema' as const,
			name: 'chain_format',
			schema: jsonSchema,
			$brand: 'auto-parseable-response-format',
			$parseRaw
		}
	} as const
}

/* runtime */
export function createChainRuntime<
	Man extends TransformerManifest,
	Exec extends { executeChain(node: unknown): Promise<unknown> }
>(manifest: Man, executor: Exec) {
	return createHydrator(manifest, executor)
}
