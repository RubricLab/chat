/* ------------------------------------------------------------------ *
 * 1.  Utility types                                                  *
 * ------------------------------------------------------------------ */

/** Any way a state value can be supplied. */
type StateProvider<S> = S | (() => S) | { getState(): S }

/** All recognised wrapper shapes. */
type Wrapper<R, S> = { react: R; state: StateProvider<S> } | { react: R; getState(): S }

/** The payload can contain raw values or wrappers, nested arbitrarily. */
export type MaybeWrapped<R = unknown, S = unknown> = Wrapper<R, S> | S

/* ----  Collect every React node buried in `T`  ------------------- */
export type CollectReact<T> = T extends { react: infer R }
	? R | CollectReact<InnerState<T>>
	: T extends readonly (infer U)[]
		? CollectReact<U>
		: T extends object
			? CollectReact<T[keyof T]>
			: never

type InnerState<T> = T extends { state: infer S }
	? S
	: T extends { getState: () => infer S }
		? S
		: never

/* ----  Collapse all getters and wrappers to reveal the pure shape  */
export type ExtractState<T> = T extends { react: unknown }
	? ExtractState<UnwrapProvider<InnerState<T>>>
	: T extends readonly (infer U)[]
		? ReadonlyArray<ExtractState<U>>
		: T extends object
			? { [K in keyof T]: ExtractState<T[K]> }
			: T

type UnwrapProvider<P> = P extends () => infer R
	? UnwrapProvider<R>
	: P extends { getState: () => infer R }
		? UnwrapProvider<R>
		: P // already raw

/* ------------------------------------------------------------------ *
 * 2.  Runtime helper                                                 *
 * ------------------------------------------------------------------ */

export function splitReactState<T>(input: T): {
	react: Array<CollectReact<T>>
	getState(): ExtractState<T>
} {
	const reactBag: unknown[] = []

	/* ----  DFS that returns a thunk producing the resolved state ---- */
	function makeThunk(node: unknown): () => unknown {
		/* Arrays ------------------------------------------------------- */
		if (Array.isArray(node)) {
			const thunks = node.map(makeThunk)
			return () => thunks.map(fn => fn())
		}

		/* Objects ------------------------------------------------------ */
		if (node !== null && typeof node === 'object') {
			const obj = node as Record<string, unknown>

			/* ------ Is this a recognised wrapper? ---------------------- */
			if ('react' in obj) {
				reactBag.push(obj.react)

				// 1 · Normalise the state provider into a function that returns S
				let provider: () => unknown

				if ('state' in obj) {
					const s = obj.state
					provider =
						typeof s === 'function'
							? (s as () => unknown) // () => S
							: s && typeof s === 'object' && 'getState' in s
								? () => (s as { getState(): unknown }).getState() // { getState }
								: () => s // raw S
				} else if ('getState' in obj && typeof obj.getState === 'function') {
					provider = () => obj.getState() // wrapper‑level getState()
				} else {
					throw new Error('Invalid wrapper: `react` present but no state provider.')
				}

				// 2 · Recurse into whatever the provider returns
				return () => makeThunk(provider())()
			}

			/* ------ Plain object --------------------------------------- */
			const entries = Object.entries(obj).map(([k, v]) => [k, makeThunk(v)] as const)
			return () => {
				const out: Record<string, unknown> = {}
				for (const [k, thunk] of entries) out[k] = thunk()
				return out
			}
		}

		/* Primitives --------------------------------------------------- */
		return () => node
	}

	const rootThunk = makeThunk(input)

	return {
		getState: rootThunk as () => ExtractState<T>,
		react: reactBag as Array<CollectReact<T>>
	}
}
