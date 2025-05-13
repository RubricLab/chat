import { createHash } from 'node:crypto'
import { z } from 'zod'

/* ───────────────── helpers ───────────────── */

export const shortHash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8)

export const stableName = (t: z.ZodTypeAny) => `Schema_${shortHash(generateSignature(t))}`

export const stableDescribe = (t: z.ZodTypeAny) =>
	t._def.description ? t : t.describe(stableName(t))

export const makeNonEmptyUnion = (xs: z.ZodTypeAny[]) =>
	xs.length === 1 ? xs[0] : z.union(xs as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]])

/* ───────────────── signature ───────────────── */

export function generateSignature(t: z.ZodTypeAny): string {
	const d = t?._def
	if (!d) return 'unknown'
	switch (d.typeName) {
		case z.ZodFirstPartyTypeKind.ZodString:
			return 'str'
		case z.ZodFirstPartyTypeKind.ZodNumber:
			return 'num'
		case z.ZodFirstPartyTypeKind.ZodBoolean:
			return 'bool'
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return 'void'
		case z.ZodFirstPartyTypeKind.ZodLiteral:
			return `lit_${JSON.stringify(d.value)}`
		case z.ZodFirstPartyTypeKind.ZodEnum:
			return `enu_${d.values.join('_')}`
		case z.ZodFirstPartyTypeKind.ZodNativeEnum:
			return `nenu_${Object.values(d.values).join('_')}`
		case z.ZodFirstPartyTypeKind.ZodArray:
			return `arr_${generateSignature(d.type)}`
		case z.ZodFirstPartyTypeKind.ZodUnion:
			return `uni_${(d.options as z.ZodTypeAny[]).map(generateSignature).sort().join('_')}`
		case z.ZodFirstPartyTypeKind.ZodObject:
			return `obj_${Object.entries(d.shape())
				.map(([k, v]) => `${k}-${generateSignature(v as z.ZodTypeAny)}`)
				.sort()
				.join('_')}`
		case z.ZodFirstPartyTypeKind.ZodOptional:
		case z.ZodFirstPartyTypeKind.ZodNullable:
		case z.ZodFirstPartyTypeKind.ZodDefault:
			return generateSignature(d.innerType)
		default:
			return 'unknown'
	}
}

/* ───────────── Zod → JSON‑Schema (min) ───────────── */

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
		case z.ZodFirstPartyTypeKind.ZodVoid:
			return { type: 'null', description: 'void' }
		case z.ZodFirstPartyTypeKind.ZodLiteral:
			return { const: d.value, type: typeof d.value }
		case z.ZodFirstPartyTypeKind.ZodEnum:
			return { type: 'string', enum: d.values }
		case z.ZodFirstPartyTypeKind.ZodNativeEnum:
			return { type: 'string', enum: Object.values(d.values) }
		case z.ZodFirstPartyTypeKind.ZodArray:
			return { type: 'array', items: zodToJsonSchema(d.type) }
		case z.ZodFirstPartyTypeKind.ZodUnion:
			return { anyOf: (d.options as z.ZodTypeAny[]).map(zodToJsonSchema) }
		case z.ZodFirstPartyTypeKind.ZodObject: {
			const props: Record<string, unknown> = {}
			const req: string[] = []
			for (const [k, v] of Object.entries(d.shape())) {
				props[k] = zodToJsonSchema(v as z.ZodTypeAny)
				req.push(k)
			}
			return { type: 'object', properties: props, required: req, additionalProperties: false }
		}
		case z.ZodFirstPartyTypeKind.ZodOptional:
		case z.ZodFirstPartyTypeKind.ZodNullable:
		case z.ZodFirstPartyTypeKind.ZodDefault:
			return zodToJsonSchema(d.innerType)
		default:
			return { type: 'unknown' }
	}
}
