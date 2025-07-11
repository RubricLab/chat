import {
	type BlockWithoutRenderArgs,
	createStatefulBlock,
	type StatefulBlockWithoutRenderArgs
} from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { TextInput } from './textInput'

export type AnyBlock =
	| BlockWithoutRenderArgs<z.ZodType>
	| StatefulBlockWithoutRenderArgs<z.ZodType, z.ZodType>

export const staticBlocks = {
	textInput: createStatefulBlock({
		description: 'Render a text input',
		render: () => ({
			component: ({ emit }) => <TextInput emit={emit} />,
			initialState: ''
		}),
		schema: {
			input: z.null(),
			output: z.string()
		}
	})
}

export const blocks = new Map<string, AnyBlock>([
	[
		'textInput',
		createStatefulBlock({
			description: 'Render a text input',
			render: () => ({
				component: ({ emit }) => <TextInput emit={emit} />,
				initialState: ''
			}),
			schema: {
				input: z.null(),
				output: z.string()
			}
		})
	] as const
])

export function getBlocks() {
	return Object.fromEntries(blocks) as Record<string, AnyBlock>
}

export function addBlock({ name, block }: { name: string; block: AnyBlock }) {
	blocks.set(name, block)
}
