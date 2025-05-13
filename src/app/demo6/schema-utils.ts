import { createHash } from 'node:crypto'
import { z } from 'zod'

/* ── helpers ──────────────────────────────────────────────────────── */

export const shortHash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8)

export const stableName = (t: z.ZodTypeAny) => `Schema_${shortHash(generateSignature(t))}`

export const stableDescribe = (t: z.ZodTypeAny) =>
	t._def.description ? t : t.describe(stableName(t))

export function makeNonEmptyUnion(opts: z.ZodTypeAny[]) {
	if (!opts.length) throw new Error('Empty union')
	return opts.length === 1
		? opts[0]
		: z.union(opts as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]])
}

/* ── signature + json-schema ─────────────────────────────────────── */

export function generateSignature(t: z.ZodTypeAny): string {
	const d = t?._def
	if (!d) return 'unknown'
	switch (d.typeName) {
		case z.ZodFirstPartyTypeKind.ZodString:
			return 'string'
		case z.ZodFirstPartyTypeKind.ZodNumber:
			return 'number'
		case z.ZodFirstPartyTypeKind.ZodBoolean:
			return 'boolean'
		case z.ZodFirstPartyTypeKind.ZodLiteral:
			return `lit_${JSON.stringify(d.value)}`
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return 'void'
		case z.ZodFirstPartyTypeKind.ZodArray:
			return `arr_${generateSignature(d.type)}`
		case z.ZodFirstPartyTypeKind.ZodObject:
			return `obj_${Object.entries(d.shape())
				.map(([k, v]) => `${k}-${generateSignature(v as z.ZodTypeAny)}`)
				.sort()
				.join('_')}`
		case z.ZodFirstPartyTypeKind.ZodUnion:
			return `union_${(d.options as z.ZodTypeAny[]).map(generateSignature).sort().join('_')}`
		case z.ZodFirstPartyTypeKind.ZodEnum:
			return `enum_${d.values.sort().join('_')}`
		case z.ZodFirstPartyTypeKind.ZodNativeEnum:
			return `nenum_${Object.values(d.values).sort().join('_')}`
		case z.ZodFirstPartyTypeKind.ZodOptional:
			return generateSignature(d.innerType)
		case z.ZodFirstPartyTypeKind.ZodNullable:
			return generateSignature(d.innerType)
		case z.ZodFirstPartyTypeKind.ZodDefault:
			return generateSignature(d.innerType)
		default:
			return 'unknown'
	}
}

export function zodToJsonSchema(t: z.ZodTypeAny): unknown {
	const d = t?._def
	if (!d) return { type: 'unknown' }
	switch (d.typeName) {
		case z.ZodFirstPartyTypeKind.ZodString:
			return { type: 'string' }
		case z.ZodFirstPartyTypeKind.ZodNumber:
			return { type: 'number' }
		case z.ZodFirstPartyTypeKind.ZodBoolean:
			return { type: 'boolean' }
		case z.ZodFirstPartyTypeKind.ZodLiteral:
			return { const: d.value, type: typeof d.value }
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return { type: 'null', description: 'void' }
		case z.ZodFirstPartyTypeKind.ZodArray:
			return { type: 'array', items: zodToJsonSchema(d.type) }
		case z.ZodFirstPartyTypeKind.ZodEnum:
			return { type: 'string', enum: d.values }
		case z.ZodFirstPartyTypeKind.ZodNativeEnum:
			return { type: 'string', enum: Object.values(d.values) }
		case z.ZodFirstPartyTypeKind.ZodObject: {
			const props: Record<string, unknown> = {}
			const req: string[] = []
			for (const [k, v] of Object.entries(d.shape())) {
				props[k] = zodToJsonSchema(v as z.ZodTypeAny)
				req.push(k)
			}
			return { type: 'object', properties: props, required: req, additionalProperties: false }
		}
		case z.ZodFirstPartyTypeKind.ZodUnion:
			return { anyOf: (d.options as z.ZodTypeAny[]).map(zodToJsonSchema) }
		case z.ZodFirstPartyTypeKind.ZodOptional:
			return zodToJsonSchema(d.innerType)
		case z.ZodFirstPartyTypeKind.ZodNullable:
			return zodToJsonSchema(d.innerType)
		case z.ZodFirstPartyTypeKind.ZodDefault:
			return zodToJsonSchema(d.innerType)
		default:
			return { type: 'unknown' } // Lazy/effects not emitted directly
	}
}
