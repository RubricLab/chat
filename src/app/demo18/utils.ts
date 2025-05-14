import z from 'zod'
import type { ActionMap, AnyAction } from './actions'

export function buildActionProxy<Action extends AnyAction, Name extends string>({
	name,
	input
}: {
	name: Name
	input: Action['schema']['input']
}) {
	return z.strictObject({
		action: z.literal(`action_${name}` as const),
		params: input
	})
}

// type ProxyOf<A extends ActionMap, K extends keyof A & string> = {
// 	action: `action_${K}`
// 	params: A[K]['schema']['input']
// }

// /* ─── compile-time machinery – ZERO run-time cost ────────────────────── */

// /** “All proxies whose action *returns* O” */
// type ProxiesFor<A extends ActionMap, O> = {
// 	[K in keyof A]: // iterate every action key
// 	A[K]['schema']['output'] extends O // does it return our type?
// 		? ProxyOf<A, K & string> // yes → include its proxy
// 		: never // no  → discard
// }[keyof A]

// /** Replace each entry in `Types` with  T | (proxies that yield T) */
// export type ReplaceTypes<A extends ActionMap, T extends Record<string, z.ZodType>> = {
// 	[K in keyof T]:
// 		| T[K] // the original schema
// 		| ProxiesFor<A, T[K]> // plus every compatible proxy (maybe `never`)
// }

// /* ─── convenience wrapper (no run-time work) ────────────────────────── */

// export function buildActionInputUnions<
// 	A extends ActionMap,
// 	T extends Record<string, z.ZodType>
// >(args: { actions: A; types: T }) {
// 	/*  nothing to do at run time – just return the inputs,
// 		but assert the richer compile-time view                         */
// 	return args as {
// 		actions: A // unchanged for now
// 		types: ReplaceTypes<A, T> // ⚡ keys keep their names, values widened
// 	}
// }

// export function buildActionInputUnions<
// 	Actions extends ActionMap,
// 	Types extends Record<string, z.ZodType>
// >({
// 	actions,
// 	types
// }: {
// 	actions: Actions
// 	types: Record<string, z.ZodType>
// }) {

// 	return {
// 		actions,
// 		types
// 	} as {
// 		actions: ReplaceTypes<Actions, Types>
// 		types: Types
// 	}
// }

export function findUnions<Types extends Record<string, z.ZodType>, Actions extends ActionMap>({
	types,
	actions
}: {
	types: Types
	actions: Actions
}) {
	const map = new WeakMap<z.ZodType, { newType: z.ZodType }>()

	return map
}

export function replaceTypes<
	Map extends WeakMap<z.ZodType, { newType: z.ZodUnion }>,
	Actions extends ActionMap
>({
	map,
	actions
}: {
	map: Map
	actions: Actions
}) {
	return {}
}

const thing = z.object({
	name: z.string(),
	age: z.number()
})

export function makeTypeUnions<Actions extends ActionMap, Types extends Record<string, z.ZodType>>({
	actions,
	types
}: {
	actions: Actions
	types: Types
}) {
	return Object.fromEntries(
		Object.entries(types).map(([k, base]) => {
			const proxies = Object.entries(actions)
				.filter(([, d]) => d.schema.output === base)
				.map(([name, d]) => buildActionProxy({ name, input: d.schema.input }))

			return [k, proxies.length ? z.union([base, ...proxies]) : base]
		})
	) as {
		[TypeKey in keyof Types]:
			| Types[TypeKey]
			| {
					[ActionKey in keyof Actions]: Actions[ActionKey]['schema']['output'] extends Types[TypeKey]
						? ReturnType<typeof buildActionProxy<Actions[ActionKey], ActionKey & string>>
						: never
			  }[keyof Actions]
	}
}
