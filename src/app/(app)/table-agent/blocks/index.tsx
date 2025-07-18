import { type AnyBlock, createBlock } from '@rubriclab/blocks'
import z from 'zod/v4'
import { button } from './button'
import { table } from './table'

export const staticBlocks = {
	cell: createBlock({
		description: 'Render text or a number in a cell',
		render: props => <p>{props}</p>,

		schema: {
			input: z.union([z.string(), z.number()])
		}
	})
}

export const genericBlocks = {
	button,
	table
}

export const blocks = new Map<string, AnyBlock>(Object.entries(staticBlocks))

export function getBlocks() {
	return Object.fromEntries(blocks) as Record<string, AnyBlock>
}

export function addBlock({ name, block }: { name: string; block: AnyBlock }) {
	blocks.set(name, block)
}
