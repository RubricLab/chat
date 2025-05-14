import { z } from 'zod'

export type ReplaceDeep<T, Old, New> = T extends any
	? [T] extends [Old]
		? New
		: T extends Array<infer U>
			? Array<ReplaceDeep<U, Old, New>>
			: T extends readonly [infer A, ...infer R]
				? { [K in keyof T]: ReplaceDeep<T[K], Old, New> }
				: T extends object
					? {
							[K in keyof T]: ReplaceDeep<T[K], Old, New>
						}
					: T
	: never

export type InferType<S extends z.ZodType> = z.infer<S>

export function deepReplace<
	Schema extends z.ZodType,
	OldSchema extends z.ZodType,
	NewSchema extends z.ZodType
>({
	schema,
	oldSchema,
	newSchema
}: { schema: Schema; oldSchema: OldSchema; newSchema: NewSchema }): z.ZodType<
	ReplaceDeep<z.infer<Schema>, z.infer<OldSchema>, z.infer<NewSchema>>
> {
	const reps = new Map<z.ZodType, z.ZodType>([[oldSchema, newSchema]])

	const impl = (s: z.ZodType, seen = new Map<z.ZodType, z.ZodType>()): z.ZodType => {
		if (reps.has(s)) return reps.get(s) ?? (undefined as never)
		if (seen.has(s)) return seen.get(s) ?? (undefined as never)

		const memo = (clone: z.ZodType) => {
			seen.set(s, clone)
			return clone
		}

		if ('unwrap' in s && typeof s.unwrap === 'function') {
			const inner = s.unwrap() as z.ZodType
			const replaced = impl(inner, seen)
			if (replaced !== inner) {
				if (s instanceof z.ZodOptional) return memo(replaced.optional())
				if (s instanceof z.ZodNullable) return memo(replaced.nullable())
				if (s instanceof z.ZodPromise) return memo(z.promise(replaced))
				if (s instanceof z.ZodArray) return memo(z.array(replaced))
				return memo(replaced)
			}
		}

		if (s instanceof z.ZodObject) {
			const obj = s as z.ZodObject<Record<string, z.ZodType>>
			const shape = obj.shape
			const out: Record<string, z.ZodType> = {}
			for (const k in shape) {
				out[k] = impl(shape[k] ?? (undefined as never), seen)
			}
			return memo(z.object(out))
		}

		if (s instanceof z.ZodUnion) {
			const opts = s.options.map(o => impl(o, seen)) as [z.ZodType, z.ZodType, ...z.ZodType[]]
			return memo(z.union(opts))
		}

		if (s instanceof z.ZodArray) {
			return memo(z.array(impl(s.element, seen)))
		}

		return s
	}

	return impl(schema) as z.ZodType<
		ReplaceDeep<z.infer<Schema>, z.infer<OldSchema>, z.infer<NewSchema>>
	>
}
