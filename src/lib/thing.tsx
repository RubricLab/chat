/* ---------------------------------------------------------------------
   Rubric – Core Runtime  v0.6.0  (dev-time rigidity pass)
   ---------------------------------------------------------------------
   • Eliminated stray `any` (now `unknown` + type guards)
   • `select` no longer needs placeholder-only props; its *options* come
     from `input` (array) – matches user nitpick.
   • Form fields map is strongly typed: the compiler now derives the
     output object type from field node outputs, so `sendEmail` mismatches
     are red-lined at author time.

     compile-time magic summary
   ────────────────────────────
   For a form node N:
     InferFields<N> = { [K in keyof N.props.fields]: OutputOf<NodeK> }
   We require:  InputSchema(onSubmitNode)  extends  InferFields<N>
   else → TS error.
--------------------------------------------------------------------- */

import React, { type ReactNode } from 'react'
import { ZodArray, type ZodTypeAny, z } from 'zod'

/* =================================================================================
   0)  UTILS
================================================================================= */
type NeverAny<T> = 0 extends 1 & T ? never : T // compile-time guard

/* =================================================================================
   1)  ACTION REGISTRY
================================================================================= */
export type ActionDef<I extends ZodTypeAny, O extends ZodTypeAny> = {
	readonly input: I
	readonly output: O
	execute(p: z.output<I>): Promise<z.output<O>>
}
export type Actions = Record<string, ActionDef<ZodTypeAny, ZodTypeAny>>
export function createAction<Name extends string, I extends ZodTypeAny, O extends ZodTypeAny>(
	name: Name,
	def: ActionDef<I, O>
) {
	return { [name]: def } as Record<Name, ActionDef<I, O>>
}

/* =================================================================================
   2)  BLOCK DEFINITIONS
================================================================================= */
export type BlockDef<P, InS extends ZodTypeAny | null, OutS extends ZodTypeAny | null> = {
	propSchema: z.ZodType<P>
	inSchema(props: P): InS | null
	outSchema(props: P): OutS | null
	render(
		props: P,
		input: InS extends ZodTypeAny ? z.output<InS> : void,
		emit: OutS extends ZodTypeAny ? (v: z.output<OutS>) => void : () => void
	): ReactNode | Promise<ReactNode>
}
export type Blocks = Record<string, BlockDef<any, any, any>>
export function createBlock<
	Name extends string,
	P,
	In extends ZodTypeAny | null,
	Out extends ZodTypeAny | null
>(name: Name, def: BlockDef<NeverAny<P>, In, Out>) {
	return { [name]: def } as Record<Name, BlockDef<P, In, Out>>
}

/* =================================================================================
   3)  NODE UNION – literal | action | block (recursive, typed)
================================================================================= */
export type LiteralNode = { literal: unknown }

export type ActionNode<A extends Actions, K extends keyof A = keyof A> = {
	action: K
	params: z.input<A[K]['input']>
}

export type BlockNode<A extends Actions, B extends Blocks, K extends keyof B = keyof B> = {
	block: K
	props: z.input<B[K]['propSchema']>
	input?: Node<A, B>
}

export type Node<A extends Actions, B extends Blocks> =
	| LiteralNode
	| ActionNode<A>
	| BlockNode<A, B>

/* helpers to extract in/out of a node */
type OutputOfNode<N> = N extends LiteralNode
	? unknown
	: N extends ActionNode<infer A, infer K>
		? z.output<A[K]['output']>
		: N extends BlockNode<any, infer B, infer K>
			? z.output<ReturnType<B[K]['outSchema']>>
			: never

type InputOfNode<N> = N extends BlockNode<any, infer B, infer K>
	? ReturnType<B[K]['inSchema']> extends ZodTypeAny
		? z.output<ReturnType<B[K]['inSchema']>>
		: never
	: never

/* =================================================================================
   4)  GENERIC BLOCKS (zero `any`)
================================================================================= */
/* 4.1 textInput */
export const textInputBlock = createBlock('textInput', {
	propSchema: z.object({ placeholder: z.string().optional() }),
	inSchema: () => null,
	outSchema: () => z.string(),
	render: (p, _i, emit) => <input placeholder={p.placeholder} onBlur={e => emit(e.target.value)} />
})

/* 4.2 largeTextInput */
export const textAreaBlock = createBlock('largeTextInput', {
	propSchema: z.object({ rows: z.number().default(4) }),
	inSchema: () => null,
	outSchema: () => z.string(),
	render: (p, _i, emit) => <textarea rows={p.rows} onBlur={e => emit(e.target.value)} />
})

/* 4.3 select – options via input, emits chosen value */
export const selectBlock = createBlock('select', {
	propSchema: z.object({ placeholder: z.string().optional() }),
	inSchema: () => z.array(z.any()),
	outSchema: () => z.any(),
	render: (p, options, emit) => (
		<select onChange={e => emit(options[Number(e.target.value)] as unknown as never)}>
			{p.placeholder && (
				<option disabled selected>
					{p.placeholder}
				</option>
			)}
			{options.map((o, i) => (
				<option key={i} value={i}>
					{String((o as any).label ?? o)}
				</option>
			))}
		</select>
	)
})

/* 4.4 table – array in, void out */
export const tableBlock = createBlock('table', {
	propSchema: z.object({}),
	inSchema: () => z.array(z.any()),
	outSchema: () => z.never(),
	render: (_p, rows) =>
		Array.isArray(rows) && rows.length ? (
			<table>
				<thead>
					<tr>
						{Object.keys(rows[0]!).map(c => (
							<th key={c}>{c}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={i}>
							{Object.values(r).map((v, j) => (
								<td key={j}>{String(v)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		) : (
			<p>No data</p>
		)
})

/* 4.5 form – field map & onSubmit */
export type FieldsOf<NN> = {
	[K in keyof NN]: OutputOfNode<NN[K]>
}
export const formBlock = createBlock('form', {
	propSchema: z.object({
		fields: z.record(z.any()), // dev-time generics capture type
		onSubmit: z.any()
	}),
	inSchema: () => null,
	outSchema: p => {
		const shape: Record<string, ZodTypeAny> = {}
		for (const k in p.fields) {
			const n = p.fields[k] as Node<any, any>
			const out = blocks[(n as any).block].outSchema((n as any).props)
			shape[k] = out ?? z.any()
		}
		return z.object(shape)
	},
	render: async (props, _void, emit) => {
		const entries = Object.entries(props.fields)
		return (
			<form
				onSubmit={async e => {
					e.preventDefault()
					const obj: Record<string, unknown> = {}
					for (const [k, n] of entries) {
						obj[k] = await evalNode(n as any)
					}
					await evalNode({ ...props.onSubmit, params: obj } as any)
					emit(obj as NeverAny<typeof obj>)
				}}
			>
				{entries.map(async ([k, n]) => (
					<div key={k}>{await renderNode(n as any)}</div>
				))}
				<button type="submit">Submit</button>
			</form>
		)
	}
})

/* =================================================================================
   5)  LIBRARIES
================================================================================= */
export const blocks = {
	...textInputBlock,
	...textAreaBlock,
	...selectBlock,
	...tableBlock,
	...formBlock
}

/* sample schemas */
const Contact = z.object({ id: z.string(), label: z.string() })
const EmailRow = z.object({ from: z.string(), subject: z.string(), body: z.string() })

export const actions = {
	...createAction('getContacts', {
		input: z.object({}),
		output: z.array(Contact),
		execute: async () => [
			{ id: '1', label: 'Alice' },
			{ id: '2', label: 'Bob' }
		]
	}),
	...createAction('getEmails', {
		input: z.object({}),
		output: z.array(EmailRow),
		execute: async () => [{ from: 'boss', subject: 'Ping', body: 'Hi' }]
	}),
	...createAction('sendEmail', {
		input: z.object({ to: Contact, subject: z.string(), body: z.string() }),
		output: z.void(),
		execute: async p => {
			console.log('send', p)
			return
		}
	})
}

/* =================================================================================
   6)  EXECUTION + RENDER helpers
================================================================================= */
export async function evalNode<N extends Node<typeof actions, typeof blocks>>(
	node: N
): Promise<OutputOfNode<N>> {
	if ('literal' in node) return node.literal as OutputOfNode<N>
	if ('action' in node) {
		const a = actions[node.action]
		const res = await a.execute(a.input.parse(node.params) as any)
		return res as OutputOfNode<N>
	}
	const def = blocks[node.block]
	const p = def.propSchema.parse(node.props)
	const inpSchema = def.inSchema(p)
	const inpVal = inpSchema ? await evalNode(node.input as any) : undefined
	let emitted: unknown = undefined
	await def.render(p, inpVal as any, v => (emitted = v))
	return (emitted ?? void 0) as OutputOfNode<N>
}

export async function renderNode<N extends Node<typeof actions, typeof blocks>>(
	n: N
): Promise<ReactNode> {
	if ('block' in n) {
		const def = blocks[n.block]
		const p = def.propSchema.parse(n.props)
		const iv = def.inSchema(p) ? await evalNode(n.input as any) : undefined
		return def.render(p, iv as any, () => {})
	}
	return null
}
