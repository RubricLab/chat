import { z } from 'zod'

export type ReplacementMap = Map<z.ZodType, z.ZodType>

type SchemaKind = 'wrapper' | 'object' | 'array' | 'union' | 'other'

function kindOf(schema: z.ZodType): SchemaKind {
	if ('unwrap' in schema && typeof schema.unwrap === 'function') return 'wrapper'
	if (schema instanceof z.ZodObject) return 'object'
	if (schema instanceof z.ZodArray) return 'array'
	if (schema instanceof z.ZodUnion) return 'union'
	return 'other'
}

export function deepReplace(
	schema: z.ZodType,
	reps: ReplacementMap,
	seen = new Map<z.ZodType, z.ZodType>()
): z.ZodType {
	if (reps.has(schema)) return reps.get(schema) ?? (undefined as never)
	if (seen.has(schema)) return seen.get(schema) ?? (undefined as never)

	const memo = (clone: z.ZodType) => {
		seen.set(schema, clone)
		return clone
	}

	if ('unwrap' in schema && typeof schema.unwrap === 'function') {
		const inner = schema.unwrap() as z.ZodType
		const newInner = deepReplace(inner, reps, seen)
		if (newInner !== inner) {
			if (schema instanceof z.ZodOptional) return memo(newInner.optional())
			if (schema instanceof z.ZodNullable) return memo(newInner.nullable())
			if (schema instanceof z.ZodArray) return memo(z.array(newInner))
			return memo(newInner)
		}
	}

	switch (kindOf(schema)) {
		case 'object': {
			const shape = (schema as z.ZodObject).shape
			const newShape: Record<string, z.ZodType> = {}
			for (const key in shape) {
				newShape[key] = deepReplace(shape[key], reps, seen)
			}
			return memo(z.object(newShape))
		}

		case 'array': {
			return memo(z.array(deepReplace((schema as z.ZodArray).element, reps, seen)))
		}

		case 'union': {
			const opts = (schema as z.ZodUnion).options
			const newOpts = opts.map(o => deepReplace(o, reps, seen)) as [
				z.ZodType,
				z.ZodType,
				...z.ZodType[]
			]
			return memo(z.union(newOpts))
		}

		default:
			return schema
	}
}
