import z from 'zod'
import { createBlock } from './lib/blocks'

export const blocks = {
	heading: createBlock({
		schema: {
			input: { text: z.string() },
			output: z.null()
		},
		render: ({ text }, { emit }) => {
			return <h1>{text}</h1>
		}
	})
}
