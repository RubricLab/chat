import { z } from 'zod'
import { makeNonEmptyUnion, stableDescribe } from './schema-utils'

/* ── core types ───────────────────────────────────────────────────── */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ActionDefinition<In extends z.ZodRawShape = any, Out extends z.ZodTypeAny = any> = {
	schema: { input: z.ZodObject<In>; output: Out }
	execute: (args: z.infer<z.ZodObject<In>>) => Promise<z.infer<Out>>
}

export type AnyActions = Record<string, ActionDefinition>

export function createAction<In extends z.ZodRawShape, Out extends z.ZodTypeAny>(def: {
	schema: { input: z.ZodObject<In>; output: Out }
	execute: (args: z.infer<z.ZodObject<In>>) => Promise<z.infer<Out>>
}): ActionDefinition<In, Out> {
	return def
}

/* ── generics for chaining ────────────────────────────────────────── */

type InputOf<A> = A extends ActionDefinition<infer P> ? z.infer<z.ZodObject<P>> : never
type OutputOf<A> = A extends ActionDefinition<any, infer O> ? z.infer<O> : never

export type ActionInvocation<Acts extends AnyActions, N extends keyof Acts> = {
	action: N
	params: {
		[P in keyof InputOf<Acts[N]>]: InputOf<Acts[N]>[P] | ActionChain<Acts, InputOf<Acts[N]>[P]>
	}
}

export type ActionChain<Acts extends AnyActions, Expect = unknown> = {
	[K in keyof Acts]: OutputOf<Acts[K]> extends Expect ? ActionInvocation<Acts, K> : never
}[keyof Acts]

export type OutputOfActionChain<
	Acts extends AnyActions,
	C extends ActionChain<Acts>
> = C extends ActionInvocation<Acts, infer N> ? OutputOf<Acts[N]> : never

/* ── executor (runtime only, no JSON-schema) ─────────────────────── */

export function createActionsExecutor<Acts extends AnyActions>(acts: Acts) {
	/* 1. lazy union for validation */
	const lazySchemas: Record<string, z.ZodTypeAny> = {}
	for (const [name, def] of Object.entries(acts)) {
		lazySchemas[name] = z.lazy(() =>
			z.object({
				action: z.literal(name),
				params: z.object(def.schema.input.shape).strict()
			})
		)
	}
	const ActionUnion = makeNonEmptyUnion(Object.values(lazySchemas))
	const rootSchema = stableDescribe(z.object({ execution: ActionUnion }).strict())

	/* 2. runtime helpers */
	async function execute<C extends ActionChain<Acts>>(
		inv: C
	): Promise<OutputOfActionChain<Acts, C>> {
		const parsed = rootSchema.parse({ execution: inv })
		return run(parsed.execution)
	}

	async function run(inv: ActionInvocation<Acts, keyof Acts>): Promise<unknown> {
		const { action, params } = inv as ActionInvocation<Acts, keyof Acts>
		const def = acts[action]
		const input: Record<string, unknown> = {}
		for (const k in params) {
			const p = params[k]
			input[k] = p && typeof p === 'object' && 'action' in p ? await run(p as any) : p
		}
		return def.execute(def.schema.input.parse(input))
	}

	return {
		execute,
		getActionNames: async () => Object.keys(acts) as Array<keyof Acts>,
		getActionSchema: async <K extends keyof Acts>() => acts[K]['schema']['input']['shape'],
		schema: rootSchema,
		_raw: acts // ⚠️ private – used by agents
	} as const
}
