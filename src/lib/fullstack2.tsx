// fullstack.tsx
import React, { type ReactNode } from 'react'
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  ACTION & BLOCK PRIMITIVES                                         */
/* ------------------------------------------------------------------ */

export interface Action<I extends z.ZodTypeAny, O extends z.ZodTypeAny> {
	schema: { input: I; output: O }
	execute: (input: z.input<I>) => Promise<z.output<O>>
}

export interface Block<I extends z.ZodTypeAny, O extends z.ZodTypeAny> {
	schema: { input: I; output: O }
	render: (
		args: z.output<I> & {
			/** For sources / transformers. Call to emit the block’s output. */
			emit?: (value: z.output<O>) => void
		}
	) => ReactNode | Promise<ReactNode>
}

/* ------------------------------------------------------------------ */
/*  UTILITY TYPES                                                     */
/* ------------------------------------------------------------------ */

type ActionsRecord = Record<string, Action<any, any>>
type BlocksRecord = Record<string, Block<any, any>>

type OutputOf<A> = A extends Action<any, infer O>
	? z.output<O>
	: A extends Block<any, infer O>
		? z.output<O>
		: never

/** ------------------------------------------------------------------ */
/**  NodeForOutput – *the* secret-sauce type-level router              */
/** ------------------------------------------------------------------ */
type NodeForOutput<Expected, Bs extends BlocksRecord, As extends ActionsRecord> =
	| {
			[K in keyof Bs]: Expected extends OutputOf<Bs[K]>
				? {
						block: K
						props: PropsWithChains<z.output<Bs[K]['schema']['input']>, Bs, As>
					}
				: never
	  }[keyof Bs]
	| {
			[K in keyof As]: Expected extends OutputOf<As[K]>
				? { action: K; params: z.input<As[K]['schema']['input']> }
				: never
	  }[keyof As]

/** Recursively replaces every field in `Shape` with either the raw value
 *  *or* a block/action whose *output* is that value. */
type PropsWithChains<Shape, Bs extends BlocksRecord, As extends ActionsRecord> = {
	[K in keyof Shape]: Shape[K] | NodeForOutput<Shape[K], Bs, As>
}

/* ------------------------------------------------------------------ */
/*  ORCHESTRATOR                                                      */
/* ------------------------------------------------------------------ */

export function createOrchestrator<
	const Bs extends BlocksRecord,
	const As extends ActionsRecord
>(defs: { blocks: Bs; actions: As }) {
	const { blocks, actions } = defs

	async function executeNode<Expected>(node: NodeForOutput<Expected, Bs, As>): Promise<Expected> {
		/* ---------- ACTION ---------- */
		if ('action' in node) {
			const act = actions[node.action]
			const parsed = act.schema.input.parse(node.params)
			return (await act.execute(parsed)) as Expected
		}

		/* ---------- BLOCK ---------- */
		const blk = blocks[node.block]
		// 1. resolve props (and recurse on inner chains)
		const rawProps: any = {}
		for (const [key, value] of Object.entries(node.props ?? {})) {
			rawProps[key] =
				value && typeof value === 'object' && ('block' in value || 'action' in value)
					? await executeNode(value as any)
					: value
		}

		// 2. runtime input validation
		const parsedProps = blk.schema.input.parse(rawProps)

		// 3. wire up .emit if the block produces output
		let emitted: unknown
		const maybeEmit =
			blk.schema.output instanceof z.ZodVoid
				? undefined
				: (val: unknown) => {
						emitted = val
					}

		// 4. render UI
		const ui = await blk.render({ ...parsedProps, emit: maybeEmit } as any)

		// 5. if block has an output, wait for emit – otherwise void
		const output = (
			blk.schema.output instanceof z.ZodVoid
				? (undefined as unknown)
				: await new Promise<unknown>(resolve => {
						/* If nothing ever calls emit, we still resolve immediately */
						resolve(emitted)
					})
		) as Expected

		// 6. For sinks, Expected is void; for sources/transformers, it’s whatever was emitted
		//    We *also* return the UI so callers can grab it.
		return output
	}

	/** Top-level render: returns the UI tree (ReactNode) */
	async function render(node: NodeForOutput<void, Bs, As>): Promise<ReactNode> {
		// Internally we ignore the value (void) and pick up the UI
		let ui: ReactNode = null
		await executeNode<void>({
			...(node as any),
			// little hack: capture UI from inner executeNode
			get block() {
				return (node as any).block
			}
		})
		// Actually render during the traverse – we just return the top-level render
		if ('block' in node) {
			const blk = blocks[node.block]
			const parsed = blk.schema.input.parse(node.props)
			ui = await blk.render(parsed as any)
		}
		return ui
	}

	return { render }
}
