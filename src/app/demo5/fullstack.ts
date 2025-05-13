/* createFullstack.ts
 * ---------------------------------------------------------------------
 * Combines @rubriclab/actions   +   @rubriclab/blocks
 * → gives you { render, execute, response_format } with strict
 *   cross-compatibility and an OpenAI-valid JSON-Schema.
 */

import { createHash } from 'node:crypto'
import type {
	ActionChain,
	ActionInvocation,
	AnyActions,
	OutputOfActionChain
} from '@rubriclab/actions'
import { createActionsExecutor, generateSignature, zodToJsonSchema } from '@rubriclab/actions'

import type { AnyBlocks, BlockChain, BlockInvocation, OutputOfBlockChain } from '@rubriclab/blocks'
import { createBlocksRenderer } from '@rubriclab/blocks'

import type { z } from 'zod'

/* ───────────────────────── helpers ───────────────────────── */

const shortHash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8)
const stableName = (schema: z.ZodTypeAny) => `Schema_${shortHash(generateSignature(schema))}`

/* ─────────── type-level glue (compile-time safety) ───────── */

export type FullstackChain<A extends AnyActions, B extends AnyBlocks, Expect = unknown> =
	| {
			[K in keyof A]: OutputOfActionChain<A, ActionInvocation<A, K>> extends Expect
				? ActionInvocation<A, K>
				: never
	  }[keyof A]
	| {
			[K in keyof B]: OutputOfBlockChain<B, BlockInvocation<B, K>> extends Expect
				? BlockInvocation<B, K>
				: never
	  }[keyof B]

type OutOf<A extends AnyActions, B extends AnyBlocks, C extends FullstackChain<A, B>> = C extends {
	action: any
}
	? OutputOfActionChain<A, C & ActionChain<A>>
	: C extends { block: any }
		? OutputOfBlockChain<B, C & BlockChain<B>>
		: never

/* ─────────────────────────── factory ─────────────────────── */

export function createFullstack<A extends AnyActions, B extends AnyBlocks>(actions: A, blocks: B) {
	/* 1️⃣  bring up the individual helpers */
	const act = createActionsExecutor(actions)
	const blk = createBlocksRenderer(blocks)

	/* 2️⃣  map “output-signature ➜ list of producers” (actions + blocks) */
	const producers: Record<string, { kind: 'action' | 'block'; name: string }[]> = {}

	const add = (kind: 'action' | 'block', name: string, out: z.ZodTypeAny) => {
		const sig = generateSignature(out)
		;(producers[sig] ||= []).push({ kind, name })
	}

	for (const [n, a] of Object.entries(actions)) add('action', n, a.schema.output)
	for (const [n, b] of Object.entries(blocks)) add('block', n, b.schema.output)

	const refFor = (p: { kind: 'action' | 'block'; name: string }) => ({
		$ref: `#/definitions/${p.name}${p.kind === 'action' ? 'Action' : 'Block'}`
	})

	/* 3️⃣  helper to build param-schemas that know *both* worlds */
	const paramSchemaFor = (param: z.ZodTypeAny): unknown => {
		const base = zodToJsonSchema(param)
		const sig = generateSignature(param)
		const refs = (producers[sig] || []).map(refFor)
		return refs.length ? { anyOf: [base, ...refs] } : base
	}

	/* 4️⃣  build fresh JSON-Schema definitions (no mutation) */
	const definitions: Record<string, unknown> = {}

	/* 4-a  standalone output-type schemas */
	new Set([...Object.values(actions), ...Object.values(blocks)].map(d => d.schema.output)).forEach(
		schema => {
			definitions[stableName(schema)] ||= zodToJsonSchema(schema)
		}
	)

	/* 4-b  action definitions */
	for (const [name, action] of Object.entries(actions)) {
		const props: Record<string, unknown> = {}
		const req: string[] = []
		for (const [k, v] of Object.entries(action.schema.input.shape)) {
			props[k] = paramSchemaFor(v as z.ZodTypeAny)
			req.push(k)
		}
		definitions[`${name}Action`] = {
			type: 'object',
			properties: {
				action: { type: 'string', const: name },
				params: {
					type: 'object',
					properties: props,
					required: req,
					additionalProperties: false
				}
			},
			required: ['action', 'params'],
			additionalProperties: false
		}
	}

	/* 4-c  block definitions */
	for (const [name, block] of Object.entries(blocks)) {
		const props: Record<string, unknown> = {}
		const req: string[] = []
		for (const [k, v] of Object.entries(block.schema.input.shape)) {
			props[k] = paramSchemaFor(v as z.ZodTypeAny)
			req.push(k)
		}
		definitions[`${name}Block`] = {
			type: 'object',
			properties: {
				block: { type: 'string', const: name },
				props: {
					type: 'object',
					properties: props,
					required: req,
					additionalProperties: false
				}
			},
			required: ['block', 'props'],
			additionalProperties: false
		}
	}

	/* 5️⃣  branch unions */
	const executionUnion = {
		anyOf: Object.keys(actions).map(n => ({ $ref: `#/definitions/${n}Action` }))
	}
	const uiUnion = {
		anyOf: Object.keys(blocks).map(n => ({ $ref: `#/definitions/${n}Block` }))
	}

	/* 6️⃣  final schema   (root object → fullstack.anyOf[…]) */
	const jsonSchema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			fullstack: {
				type: 'object',
				anyOf: [
					{
						type: 'object',
						properties: { execution: executionUnion },
						required: ['execution'],
						additionalProperties: false
					},
					{
						type: 'object',
						properties: { ui: uiUnion },
						required: ['ui'],
						additionalProperties: false
					}
				]
			}
		},
		required: ['fullstack'],
		additionalProperties: false,
		definitions
	} as const

	/* 7️⃣  runtime helpers */
	async function execute<C extends FullstackChain<A, B>>(chain: C): Promise<OutOf<A, B, C>> {
		if ('action' in (chain as any)) return act.execute(chain as any) as unknown as OutOf<A, B, C>

		const { props } = chain as BlockInvocation<B, keyof B>
		await Promise.all(
			Object.values(props).map(v =>
				v && typeof v === 'object' && ('action' in v || 'block' in v) ? execute(v as any) : undefined
			)
		)
		return undefined as OutOf<A, B, C> // blocks “return” via emit
	}

	function render<C extends FullstackChain<A, B>>(chain: C, onEmit?: (v: OutOf<A, B, C>) => void) {
		if ('action' in (chain as any)) return null
		return blk.render(chain as any, onEmit as any)
	}

	const response_format = {
		type: 'json_schema' as const,
		name: 'fullstack_format',
		schema: jsonSchema,
		$brand: 'auto-parseable-response-format',
		$parseRaw(raw: string) {
			const obj = JSON.parse(raw)
			if (!obj.fullstack || typeof obj.fullstack !== 'object')
				throw new Error('Payload must contain top-level "fullstack" key')

			if ('execution' in obj.fullstack)
				return (act.response_format as any).$parseRaw(
					JSON.stringify({ execution: obj.fullstack.execution })
				)

			if ('ui' in obj.fullstack)
				return (blk.response_format as any).$parseRaw(JSON.stringify({ ui: obj.fullstack.ui }))

			throw new Error('fullstack must contain either "execution" or "ui" branch')
		}
	}

	return { render, execute, response_format } as const
}
