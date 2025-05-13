import type React from 'react'
import { type ReactNode, useState } from 'react'
import { z } from 'zod'
import { makeNonEmptyUnion, stableDescribe } from './schema-utils'

/* ── core types ───────────────────────────────────────────────────── */

export type BlockDefinition<In extends z.ZodRawShape = any, Out extends z.ZodTypeAny = any> = {
	schema: { input: z.ZodObject<In>; output: Out }
	render: (props: z.infer<z.ZodObject<In>>, ctx: { emit: (v: z.infer<Out>) => void }) => ReactNode
}

export type AnyBlocks = Record<string, BlockDefinition>

export function createBlock<In extends z.ZodRawShape, Out extends z.ZodTypeAny>(def: {
	schema: { input: z.ZodObject<In>; output: Out }
	render: (props: z.infer<z.ZodObject<In>>, ctx: { emit: (v: z.infer<Out>) => void }) => ReactNode
}): BlockDefinition<In, Out> {
	return def
}

/* ── generics for chaining ───────────────────────────────────────── */

type InputOf<B> = B extends BlockDefinition<infer P> ? z.infer<z.ZodObject<P>> : never
type OutputOf<B> = B extends BlockDefinition<any, infer O> ? z.infer<O> : never

export type BlockInvocation<Blks extends AnyBlocks, N extends keyof Blks> = {
	block: N
	props: {
		[P in keyof InputOf<Blks[N]>]: InputOf<Blks[N]>[P] | BlockChain<Blks, InputOf<Blks[N]>[P]>
	}
}

export type BlockChain<Blks extends AnyBlocks, Expect = unknown> = {
	[K in keyof Blks]: OutputOf<Blks[K]> extends Expect ? BlockInvocation<Blks, K> : never
}[keyof Blks]

export type OutputOfBlockChain<
	Blks extends AnyBlocks,
	C extends BlockChain<Blks>
> = C extends BlockInvocation<Blks, infer N> ? OutputOf<Blks[N]> : never

/* ── renderer (runtime only) ─────────────────────────────────────── */

export function createBlocksRenderer<Blks extends AnyBlocks>(blks: Blks) {
	/* 1. lazy union for validation */
	const lazySchemas: Record<string, z.ZodTypeAny> = {}
	for (const [name, def] of Object.entries(blks)) {
		lazySchemas[name] = z.lazy(() =>
			z.object({
				block: z.literal(name),
				props: z.object(def.schema.input.shape).strict()
			})
		)
	}
	const UIUnion = makeNonEmptyUnion(Object.values(lazySchemas))
	const rootSchema = stableDescribe(z.object({ ui: UIUnion }).strict())

	/* 2. recursive render component */
	type AnyInv = BlockInvocation<Blks, keyof Blks>
	const Invocation: React.FC<{ inv: AnyInv; onEmit?: (v: unknown) => void }> = ({ inv, onEmit }) => {
		const { block: name, props } = inv as BlockInvocation<Blks, keyof Blks>
		const def = blks[name]
		const resolved: Record<string, unknown> = {}
		const children: ReactNode[] = []

		Object.entries(props).forEach(([k, v]) => {
			if (v && typeof v === 'object' && 'block' in v) {
				const [val, setVal] = useState<unknown>()
				resolved[k] = val
				children.push(<Invocation key={`${name}-${k}`} inv={v as AnyInv} onEmit={setVal} />)
			} else resolved[k] = v
		})

		return (
			<>
				{def.render(resolved as never, { emit: onEmit ?? (() => {}) })}
				{children}
			</>
		)
	}

	function render<C extends BlockChain<Blks>>(
		inv: C,
		onEmit?: (v: OutputOfBlockChain<Blks, C>) => void
	) {
		return <Invocation inv={inv as AnyInv} onEmit={onEmit as any} />
	}

	return {
		render,
		getBlockNames: async () => Object.keys(blks) as Array<keyof Blks>,
		getBlockSchema: async <K extends keyof Blks>() => blks[K]['schema']['input']['shape'],
		schema: rootSchema,
		_raw: blks // ⚠️ private – used by agents
	} as const
}
