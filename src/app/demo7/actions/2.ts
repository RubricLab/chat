import { z } from 'zod'

/*─────────────────────────────────────────────────*
 *  Actions – tiny, strictly‑typed command language *
 *─────────────────────────────────────────────────*/

/**
 * Every action has a Zod‑validated *input* schema, a Zod *output* schema, and an
 * `execute` implementation.  The generic parameters keep the relationship
 * between the three perfectly intact at all call‑sites.
 */
export type Action<I extends z.AnyZodObject, O extends z.ZodTypeAny> = {
	readonly kind: 'action'
	readonly schema: {
		readonly input: I
		readonly output: O
	}
	readonly execute: (args: z.infer<I>) => Promise<z.infer<O>>
}

/**
 * Factory that infers the generic parameters from the supplied schemas.
 */
export function createAction<I extends z.AnyZodObject, O extends z.ZodTypeAny>(opts: {
	schema: { input: I; output: O }
	execute: (args: z.infer<I>) => Promise<z.infer<O>>
}): Action<I, O> {
	return { kind: 'action', ...opts }
}

/*──────────────────────── manifests ────────────────────────*/

export type ActionManifest = Record<string, Action<z.AnyZodObject, z.ZodTypeAny>>

/*──────────────────────── helper types ──────────────────────*/

// Inference helpers ----------------------------------------------------------

type InputOf<A extends Action<any, any>> = z.infer<A['schema']['input']>

type OutputOf<A extends Action<any, any>> = z.infer<A['schema']['output']>

// ValueFor – If any action in the manifest can *produce* V, allow a nested
//            ActionNode; otherwise just V itself.

type ValueFor<M extends ActionManifest, V> =
	| V
	| {
			[K in keyof M]: OutputOf<M[K]> extends V ? ActionNode<M, K> : never
	  }[keyof M]

// Builds the `params` shape recursively for a given action name -------------

type RecursiveParams<M extends ActionManifest, N extends keyof M> = {
	[K in keyof InputOf<M[N]>]: ValueFor<M, InputOf<M[N]>[K]>
}

// Public type developers can reference when hand‑writing invocation objects --

export type ActionNode<M extends ActionManifest, N extends keyof M> = {
	action: N
	params: RecursiveParams<M, N>
}

/*─────────────────────── executor ──────────────────────────*/

export function createActionsExecutor<M extends ActionManifest>(manifest: M) {
	// Single action runner -----------------------------------------------------
	async function run<N extends keyof M>(name: N, raw: InputOf<M[N]>): Promise<OutputOf<M[N]>> {
		const def = manifest[name]
		const parsed = def.schema.input.parse(raw)
		return def.execute(parsed)
	}

	// Generic recursive resolver (arrays, objects, nested actions) -------------
	async function resolve(value: unknown): Promise<unknown> {
		// (1) Action node
		if (value && typeof value === 'object' && 'action' in value) {
			const node = value as ActionNode<M, keyof M>
			const resolvedParams: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(node.params)) {
				resolvedParams[k] = await resolve(v)
			}
			return run(node.action as keyof M, resolvedParams as any)
		}

		// (2) Array
		if (Array.isArray(value)) {
			return Promise.all(value.map(resolve))
		}

		// (3) Plain object (deep map)
		if (value && typeof value === 'object') {
			const out: Record<string, unknown> = {}
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				out[k] = await resolve(v)
			}
			return out
		}

		// (4) Primitives
		return value
	}

	return { executeChain: resolve } as const
}

/*──────────────────────── usage example ─────────────────────*/

// Example schemas -----------------------------------------------------------
export const Contact = z.object({ id: z.string(), email: z.string() })

const { executeChain } = createActionsExecutor({
	sendEmail: createAction({
		schema: {
			input: z.object({
				to: Contact,
				subject: z.string(),
				body: z.string()
			}),
			output: z.void()
		},
		execute: async v => {
			console.log('EMAIL:', v)
		}
	}),

	getContacts: createAction({
		schema: {
			input: z.object({}),
			output: z.array(Contact)
		},
		execute: async () => [
			{ id: '1', email: 'alice@test.com' },
			{ id: '2', email: 'bob@test.com' }
		]
	}),

	generateRandomString: createAction({
		schema: {
			input: z.object({}),
			output: z.string()
		},
		execute: async () => Math.random().toString(36).substring(2, 15)
	}),

	getUserEmail: createAction({
		schema: {
			input: z.object({ userId: z.string() }),
			output: z.string()
		},
		execute: async ({ userId }) => {
			console.log('USER ID:', userId)
			return 'alice@test.com'
		}
	})
})

// Type‑safe nested invocation ----------------------------------------------
const result = await executeChain({
	action: 'sendEmail',
	params: {
		to: {
			id: { action: 'generateRandomString', params: {} },
			email: { action: 'getUserEmail', params: { userId: '1' } }
		},
		subject: 'Hello',
		body: 'Hello, world!'
	}
})

console.log(result)
