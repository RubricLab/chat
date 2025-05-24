import { createBlock, createBlockProxy, createBlockRenderer } from '@rubriclab/blocks'
import { z } from 'zod/v4'

export const uiRegistry = z.registry<{ id: string }>()

const heading = createBlock({
	schema: {
		input: {
			message: z.string()
		},
		output: z.string()
	},
	render: ({ message }) => <h1>{message}</h1>
})

const headingBlock = createBlockProxy({
	name: 'heading',
	input: heading.schema.input
}).register(uiRegistry, { id: 'heading' })

export const { render } = createBlockRenderer({
	blocks: {
		heading
	}
})

export const blocks = z.union([headingBlock])
