import { type ActionChain, type AnyActions, createActionsExecutor } from '@rubriclab/actions' // <- your working package
import React, { type ReactNode } from 'react'
import { z } from 'zod'
import { stableDescribe, stableName, zodToJsonSchema } from './common'

/* ──────────────────────────────────────────────────────────── */
/* 1️⃣  PUBLIC  API                                            */
/* ──────────────────────────────────────────────────────────── */

export interface BlockDefinition<
	In extends z.ZodRawShape = any,
	Out extends z.ZodTypeAny = z.ZodVoid
> {
	schema: { input: z.ZodObject<In>; output: Out }
	render: (args: z.infer<z.ZodObject<In>> & { emit: (v: z.infer<Out>) => void }) => ReactNode
}

export type BlockFactory<Param extends z.ZodTypeAny, Out extends z.ZodTypeAny = z.ZodVoid> = (
	param: Param
) => BlockDefinition<any, Out>

export function createBlock<In extends z.ZodRawShape, Out extends z.ZodTypeAny = z.ZodVoid>(
	def: BlockDefinition<In, Out>
): typeof def

export function createBlock<Param extends z.ZodTypeAny, Out extends z.ZodTypeAny = z.ZodVoid>(
	factory: BlockFactory<Param, Out>
): typeof factory

export function createBlock(arg: any): any {
	return arg
}

/* ──────────────────────────────────────────────────────────── */
/* 2️⃣  CHAIN  TYPES                                           */
/* ──────────────────────────────────────────────────────────── */

type AnyBlocks = Record<string, BlockDefinition>

type InputOf<B> = B extends BlockDefinition<infer S> ? z.infer<z.ZodObject<S>> : never
type OutputOf<B> = B extends BlockDefinition<infer _, infer O> ? z.infer<O> : never

export type BlockInvocation<Bs extends AnyBlocks, Name extends keyof Bs> = {
	block: Name
	props: {
		[K in keyof InputOf<Bs[Name]>]:
			| InputOf<Bs[Name]>[K]
			| BlockChain<Bs, InputOf<Bs[Name]>[K]>
			| ActionChain<any, InputOf<Bs[Name]>[K]>
	}
}

export type BlockChain<Bs extends AnyBlocks, Expected = unknown> = {
	[K in keyof Bs]: OutputOf<Bs[K]> extends Expected ? BlockInvocation<Bs, K> : never
}[keyof Bs]

/* ──────────────────────────────────────────────────────────── */
/* 3️⃣  EXECUTOR                                               */
/* ──────────────────────────────────────────────────────────── */

export function createBlocksExecutor<Acts extends AnyActions, Bs extends AnyBlocks>(
	blocks: Bs,
	actionsExec = createActionsExecutor({} as Acts)
) {
	/* … helpers to detect “isRenderNode” … */
	type RenderNode = BlockChain<Bs> | ActionChain<Acts>

	const isRenderNode = (x: unknown): x is RenderNode =>
		!!x && typeof x === 'object' && ('block' in x || 'action' in x)

	/* ── runtime render (async because nested actions) ──────── */
	async function render(node: RenderNode): Promise<unknown> {
		if ('action' in node) return actionsExec.execute(node as any)
		/* block */
		const { block: name, props } = node as any
		const def = blocks[name]
		if (!def) throw new Error(`Unknown block ${String(name)}`)

		const parsed: Record<string, unknown> = {}
		for (const k in props) {
			const v = props[k]
			parsed[k] = isRenderNode(v) ? await render(v) : v
		}

		let emitted: unknown
		def.render({
			...(def.schema.input.parse(parsed) as any),
			emit: (x: unknown) => {
				emitted = x
			}
		})
		return emitted ?? null
	}

	/* ── build JSON-Schema  & TS schema for LLM  ────────────── */

	/*  a) map output-type → blocks that produce it  */
	const blocksByOutput: Record<string, string[]> = {}
	Object.entries(blocks).forEach(([n, b]) => {
		const id = stableName(b.schema.output)
		if (!blocksByOutput[id]) blocksByOutput[id] = []
		blocksByOutput[id].push(n)
	})

	/*  b) lazy per-block schema with recursion back to RenderNode */
	const blockSchemas: Record<string, z.ZodTypeAny> = {}
	const blockBuilders: Record<string, () => z.ZodTypeAny> = {}

	const paramSchema = (param: z.ZodTypeAny): z.ZodTypeAny => {
		const refId = stableName(param)
		const compatibleBlocks = (blocksByOutput[refId] ?? [])
			.map(n => blockSchemas[n])
			.filter(Boolean) as z.ZodTypeAny[]
		const compatibleActions = (actionsExec as any).actionsByOutputName?.[refId] ?? []
		const actionSchemas = compatibleActions.map((n: string) => (actionsExec as any).actionSchemas[n])
		const anyOf = [...compatibleBlocks, ...actionSchemas]
		return stableDescribe(anyOf.length ? z.union([param, ...anyOf]) : param)
	}

	Object.entries(blocks).forEach(([name, def]) => {
		blockBuilders[name] = () => {
			const shape: Record<string, z.ZodTypeAny> = {}
			for (const k in def.schema.input.shape) shape[k] = paramSchema(def.schema.input.shape[k])
			return z.object({ block: z.literal(name), props: z.object(shape).strict() })
		}
	})
	Object.keys(blocks).forEach(n => {
		blockSchemas[n] = z.lazy(blockBuilders[n]!)
	})

	const BlockUnion = z.lazy(() =>
		stableDescribe(z.union(Object.values(blockSchemas) as [z.ZodTypeAny, ...z.ZodTypeAny[]]))
	)

	/* The RenderNode we export so fullstack can extend it */
	const RenderNodeSchema = z.lazy(() => z.union([BlockUnion, (actionsExec as any).ActionUnion]))

	const schema = z.object({ render: RenderNodeSchema }).strict()

	/* ---------- make json-schema / response_format ---------- */
	const { makeCustomResponseFormat } = actionsExec as any // reuse helper
	const response_format = makeCustomResponseFormat(zodToJsonSchema(schema), (txt: string) =>
		schema.parse(JSON.parse(txt))
	)

	return {
		render,
		RenderNode: RenderNodeSchema,
		schema,
		response_format
	}
}
