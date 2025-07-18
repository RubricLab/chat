import {
	type BlockWithoutRenderArgs,
	createBlock,
	type StatefulBlockWithoutRenderArgs
} from '@rubriclab/blocks'
import { custom } from '@rubriclab/chains/lib2/utils'
import type { ReactNode } from 'react'
import z from 'zod/v4'
export type AnyBlock =
	| BlockWithoutRenderArgs<z.ZodType>
	| StatefulBlockWithoutRenderArgs<z.ZodType, z.ZodType>

export const REACT_NODE = custom<ReactNode, 'ReactNode'>('ReactNode')

export const staticBlocks = {
	cell: createBlock({
		description: 'Render text or a number in a cell',
		render: props => <p>{props}</p>,

		schema: {
			input: z.union([z.string(), z.number()])
		}
	})
}

export const blocks = new Map<string, AnyBlock>(Object.entries(staticBlocks))

export function getBlocks() {
	return Object.fromEntries(blocks) as Record<string, AnyBlock>
}

export function addBlock({ name, block }: { name: string; block: AnyBlock }) {
	blocks.set(name, block)
}
