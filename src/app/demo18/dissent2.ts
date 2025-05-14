import z from 'zod'

type DeepReplace<A extends ActionMap, T> =
	| (T extends z.ZodTypeAny ? UnionFor<A, T> : never)
	| (T extends z.ZodObject<infer S, infer P, infer C>
			? z.ZodObject<{ [K in keyof S]: DeepReplace<A, S[K]> }, P, C>
			: never)
	| (T extends z.ZodArray<infer U> ? z.ZodArray<DeepReplace<A, U>> : never)
	| (T extends z.ZodUnion<infer U> ? z.ZodUnion<{ [I in keyof U]: DeepReplace<A, U[I]> }> : never)
	| (T extends z.ZodOptional<infer U> ? z.ZodOptional<DeepReplace<A, U>> : never)
	| (T extends z.ZodNullable<infer U> ? z.ZodNullable<DeepReplace<A, U>> : never)

/* ── aliases for brevity ─────────────────────────────────────────────── */
type Z = z.ZodTypeAny
type ActionDef = { name: string; schema: { input: Z; output: Z } }
export type ActionMap = Record<string, ActionDef>

/* one-liner proxy constructor (runtime) */
const proxy = ({ name, schema: { input } }: ActionDef) =>
	z.strictObject({ action: z.literal(`action_${name}`), params: input })

/* compile-time: proxy type for action key K */
type ProxyOf<A extends ActionMap, K extends keyof A & string> = ReturnType<typeof proxy> & {
	action: `action_${K}`
}

/* union of proxies that output O */
type UnionFor<A extends ActionMap, O> =
	| O
	| {
			[K in keyof A]: A[K]['schema']['output'] extends O ? ProxyOf<A, K & string> : never
	  }[keyof A]

/* ── tiny walker (uses ZodTypeAny everywhere) ───────────────────────── */
const walk = (s: Z, f: (x: Z) => Z): Z => {
	const hit = f(s)
	if (hit !== s) return hit
	if (s instanceof z.ZodObject)
		return z.object(Object.fromEntries(Object.entries(s.shape).map(([k, v]) => [k, walk(v, f)])))
	if (s instanceof z.ZodArray) return z.array(walk(s.element, f))
	if (s instanceof z.ZodUnion) return z.union(s.options.map(o => walk(o, f)) as any)
	if (s instanceof z.ZodOptional) return walk(s.unwrap(), f).optional()
	if (s instanceof z.ZodNullable) return walk(s.unwrap(), f).nullable()
	return s
}

/* ── helper: concrete schema type of a value in T --------------------- */
type SchemaOf<T extends Record<string, Z>, K extends keyof T> = T[K]

/* ── main one-liner ---------------------------------------------------- */
export function joinProducers<A extends ActionMap, T extends Record<string, Z>>(
	actions: A,
	types: T
) {
	const map = new WeakMap<Z, Z>()

	/* seed + add proxies */
	Object.values(types).forEach(t => map.set(t, t))
	Object.values(actions).forEach(a => {
		const u = map.get(a.schema.output)!
		map.set(a.schema.output, z.union([u, proxy(a)]))
	})

	/* unions with exact typing */
	const unions = Object.fromEntries(
		Object.entries(types).map(([k, t]) => [k, map.get(t)! as UnionFor<A, SchemaOf<T, typeof k>>])
	) as { [K in keyof T]: UnionFor<A, T[K]> }

	/* lifted actions */
	const lifted = Object.fromEntries(
		Object.entries(actions).map(([k, def]) => [
			k,
			{
				...def,
				schema: {
					input: walk(def.schema.input, s => map.get(s) ?? s) as DeepReplace<
						typeof actions,
						typeof def.schema.input
					>,
					output: map.get(def.schema.output)! as UnionFor<typeof actions, typeof def.schema.output>
				}
			}
		])
	) as { [K in keyof typeof actions]: (typeof actions)[K] }

	return { unions, actions: lifted }
}
