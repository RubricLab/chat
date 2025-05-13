import type { z } from 'zod'
import { generateSignature, stableName, zodToJsonSchema } from './schema-utils'

/* ── public factory ──────────────────────────────────────────────── */

export function createAgent<
	Acts extends Record<string, any>,
	Blks extends Record<string, any>
>(opts: {
	actions?: { _raw: Acts }
	blocks?: { _raw: Blks }
}) {
	const actions = opts.actions?._raw ?? {}
	const blocks = opts.blocks?._raw ?? {}

	/* 1️⃣  collect producers per output-signature */
	const producers: Record<string, { kind: 'action' | 'block'; name: string }[]> = {}
	const add = (kind: 'action' | 'block', name: string, out: z.ZodTypeAny) => {
		const sig = generateSignature(out)
		;(producers[sig] ||= []).push({ kind, name })
	}
	Object.entries(actions).forEach(([n, a]) => add('action', n, a.schema.output))
	Object.entries(blocks).forEach(([n, b]) => add('block', n, b.schema.output))

	const refFor = (p: { kind: 'action' | 'block'; name: string }) => ({
		$ref: `#/definitions/${p.name}${p.kind === 'action' ? 'Action' : 'Block'}`
	})

	/* 2️⃣  helper to upgrade a param schema to “value **or** producer” */
	const paramSchemaFor = (param: z.ZodTypeAny): unknown => {
		const base = zodToJsonSchema(param)
		const refs = (producers[generateSignature(param)] ?? []).map(refFor)
		return refs.length ? { anyOf: [base, ...refs] } : base
	}

	/* 3️⃣  build JSON-Schema definitions */
	const defs: Record<string, unknown> = {}

	//   3-a output leaf schemas
	new Set([
		...Object.values(actions).map(a => a.schema.output),
		...Object.values(blocks).map(b => b.schema.output)
	]).forEach(sch => (defs[stableName(sch)] = zodToJsonSchema(sch)))

	//   3-b actions
	for (const [name, act] of Object.entries(actions)) {
		const props: Record<string, unknown> = {}
		const req: string[] = []
		for (const [k, v] of Object.entries(act.schema.input.shape))
			(props[k] = paramSchemaFor(v as z.ZodTypeAny)), req.push(k)
		defs[`${name}Action`] = {
			type: 'object',
			properties: {
				action: { type: 'string', const: name },
				params: { type: 'object', properties: props, required: req, additionalProperties: false }
			},
			required: ['action', 'params'],
			additionalProperties: false
		}
	}

	//   3-c blocks
	for (const [name, blk] of Object.entries(blocks)) {
		const props: Record<string, unknown> = {}
		const req: string[] = []
		for (const [k, v] of Object.entries(blk.schema.input.shape))
			(props[k] = paramSchemaFor(v as z.ZodTypeAny)), req.push(k)
		defs[`${name}Block`] = {
			type: 'object',
			properties: {
				block: { type: 'string', const: name },
				props: { type: 'object', properties: props, required: req, additionalProperties: false }
			},
			required: ['block', 'props'],
			additionalProperties: false
		}
	}

	/* 4️⃣  branch unions + root schema */
	const execUnion = { anyOf: Object.keys(actions).map(n => ({ $ref: `#/definitions/${n}Action` })) }
	const uiUnion = { anyOf: Object.keys(blocks).map(n => ({ $ref: `#/definitions/${n}Block` })) }

	const properties: Record<string, unknown> = {}
	const anyOfReq: any[] = []

	if (Object.keys(actions).length) {
		properties.execution = execUnion
		anyOfReq.push({ required: ['execution'] })
	}
	if (Object.keys(blocks).length) {
		properties.ui = uiUnion
		anyOfReq.push({ required: ['ui'] })
	}

	const branchSchemas: unknown[] = []

	if (Object.keys(actions).length) {
		branchSchemas.push({
			type: 'object',
			properties: { execution: execUnion },
			required: ['execution'],
			additionalProperties: false
		})
	}
	if (Object.keys(blocks).length) {
		branchSchemas.push({
			type: 'object',
			properties: { ui: uiUnion },
			required: ['ui'],
			additionalProperties: false
		})
	}

	const jsonSchema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			fullstack: {
				type: 'object',
				anyOf: branchSchemas,
				additionalProperties: false
			}
		},
		required: ['fullstack'],
		additionalProperties: false,
		definitions: defs
	} as const

	/* 5️⃣  parse helper (delegates to user-land schema if desired) */
	function $parseRaw(raw: string) {
		const obj = JSON.parse(raw)
		if (!obj.fullstack || typeof obj.fullstack !== 'object')
			throw new Error('Payload must contain top‑level "fullstack"')
		if (obj.fullstack.execution && !actions) throw new Error('"execution" branch not allowed')
		if (obj.fullstack.ui && !blocks) throw new Error('"ui" branch not allowed')
		return obj.fullstack // or delegate deeper if you like
	}

	const response_format = {
		type: 'json_schema' as const,
		name: 'agent_format',
		schema: jsonSchema,
		$brand: 'auto-parseable-response-format',
		$parseRaw
	} as const

	return { response_format } as const
}
