import z from 'zod'

/*──────── domain basics ───────*/
type Z = z.ZodTypeAny
type ActionDef = { schema: { input: Z; output: Z } }
export type ActionMap = Record<string, ActionDef>

/* one proxy (runtime) */
const proxy = (name: string, input: Z) =>
	z.strictObject({ action: z.literal(`action_${name}`), params: input })

/* proxy *type* for key K  */
type ProxyOf<A extends ActionMap, K extends keyof A & string> = ReturnType<
	typeof proxy extends (...args: [any, infer I]) => infer R ? (name: K, input: I) => R : never
>

/* widen T with proxies that return T */
type ReplaceTypes<A extends ActionMap, T extends Record<string, Z>> = {
	[K in keyof T]:
		| T[K]
		| {
				[P in keyof A]: A[P]['schema']['output'] extends T[K] ? ProxyOf<A, P & string> : never
		  }[keyof A]
}

/*──────── helper 1: unions + lookup map ───────*/
function buildUnionMap<A extends ActionMap>(actions: A, types: Record<string, Z>) {
	const map = new WeakMap<Z, Z>() // schema → union(schema | proxies)

	// start with plain types
	Object.values(types).forEach(s => map.set(s, s))

	// add proxies
	for (const [
		name,
		{
			schema: { input, output }
		}
	] of Object.entries(actions) as [keyof A & string, A[keyof A]][]) {
		const u = map.get(output)!
		map.set(output, z.union([u, proxy(name, input)]))
	}
	return map
}

/*──────── helper 2: deep-lift any schema with the map ───────*/
function lift(schema: Z, map: WeakMap<Z, Z>): Z {
	const hit = map.get(schema)
	if (hit) return hit
	if (schema instanceof z.ZodObject)
		return z.object(
			Object.fromEntries(Object.entries(schema.shape).map(([k, v]) => [k, lift(v, map)]))
		)
	if (schema instanceof z.ZodArray) return z.array(lift(schema.element, map))
	if (schema instanceof z.ZodUnion) return z.union(schema.options.map(o => lift(o, map)) as any)
	if (schema instanceof z.ZodOptional) return lift(schema.unwrap(), map).optional()
	if (schema instanceof z.ZodNullable) return lift(schema.unwrap(), map).nullable()
	return schema
}

/*──────── public one-liner ───────*/
export function joinProducers<A extends ActionMap, T extends Record<string, Z>>(
	actions: A,
	types: T
) {
	const m = buildUnionMap(actions, types)
	const unions = Object.fromEntries(
		Object.entries(types).map(([k, s]) => [k, m.get(s)!])
	) as ReplaceTypes<A, T>

	const lifted = Object.fromEntries(
		Object.entries(actions).map(([k, def]) => [
			k,
			{ ...def, schema: { input: lift(def.schema.input, m), output: def.schema.output } }
		])
	) as { [K in keyof A]: A[K] }

	return { unions, actions: lifted }
}
