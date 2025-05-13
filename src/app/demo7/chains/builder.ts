import { z } from 'zod'
import {
	generateSignature,
	makeNonEmptyUnion,
	stableDescribe,
	stableName,
	zodToJsonSchema
} from '../schema-tools'
import type { Transformer } from './transformers'

function createDisc(t: any): 'action' | 'block' {
	// #1 – explicit flag survives most minifiers
	if (t.kind === 'action' || t.kind === 'block') return t.kind

	// #2 – look for execute/render on impl
	if (t.impl && typeof t.impl === 'object') {
		if ('execute' in t.impl) return 'action'
		if ('render' in t.impl) return 'block'
	}

	// #3 – look for execute/render hoisted to root
	if ('execute' in t) return 'action'
	if ('render' in t) return 'block'

	// default to block (safe fallback)
	return 'block'
}

type Manifest = Record<string, Transformer<any, any, any>>

export function buildSchemas(manifest: Manifest) {
	/* output‑sig → producers */
	const bySig: Record<string, string[]> = {}
	for (const [name, tr] of Object.entries(manifest)) {
		const sig = generateSignature(tr.schema.output)
		;(bySig[sig] ||= []).push(name)
	}

	/* invocation schemas */
	const inv: Record<string, z.ZodTypeAny> = {}
	const param = (s: z.ZodTypeAny) => {
		const sig = generateSignature(s)
		const refs = (bySig[sig] ?? []).map(n => z.lazy(() => inv[n]))
		return stableDescribe(refs.length ? makeNonEmptyUnion([s, ...refs]) : s)
	}

	for (const [name, tr] of Object.entries(manifest)) {
		const shape: Record<string, z.ZodTypeAny> = {}
		for (const [k, v] of Object.entries(tr.schema.input.shape)) shape[k] = param(v as z.ZodTypeAny)
		const disc = createDisc(tr)
		const key = disc === 'action' ? 'params' : 'props'
		inv[name] = z.object({ [disc]: z.literal(name), [key]: z.object(shape).strict() })
	}

	const InvocationUnion = makeNonEmptyUnion(Object.values(inv))
	const zodSchema = z.object({ chain: stableDescribe(InvocationUnion) }).strict()

	/* JSON defs */
	const defs: Record<string, unknown> = {}
	const ensure = (t: z.ZodTypeAny) => (defs[stableName(t)] ||= zodToJsonSchema(t))

	for (const tr of Object.values(manifest)) ensure(tr.schema.output)

	for (const [name, tr] of Object.entries(manifest)) {
		const props: Record<string, unknown> = {}
		const req: string[] = []
		for (const [k, v] of Object.entries(tr.schema.input.shape)) {
			const base = zodToJsonSchema(v as z.ZodTypeAny)
			const sig = generateSignature(v as z.ZodTypeAny)
			const refs = (bySig[sig] ?? []).map(n => ({ $ref: `#/definitions/${n}` }))
			props[k] = refs.length ? { anyOf: [base, ...refs] } : base
			req.push(k)
		}
		const disc = createDisc(tr)
		const key = disc === 'action' ? 'params' : 'props'
		defs[name] = {
			type: 'object',
			properties: {
				[disc]: { type: 'string', const: name },
				[key]: { type: 'object', properties: props, required: req, additionalProperties: false }
			},
			required: [disc, key],
			additionalProperties: false
		}
	}

	const jsonSchema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			chain: { anyOf: Object.keys(manifest).map(n => ({ $ref: `#/definitions/${n}` })) }
		},
		required: ['chain'],
		additionalProperties: false,
		definitions: defs
	} as const

	return { zodSchema, jsonSchema }
}
