import { createTool } from '@rubriclab/agents'
import { createGenericStatefulBlock } from '@rubriclab/blocks'
import type { z } from 'zod/v4'
import { actionSchemas } from '../actions'

const selectCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_key, { input }]) => {
		return Array.isArray(input)
	})
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['output'] extends z.ZodArray
		? K
		: never]: (typeof actionSchemas)[K]
}

const selectSchemas = Object.fromEntries(
	Object.entries(selectCompatibleActions).map(([key, { output }]) => [
		key,
		{ input: output, output: output.def.element }
	])
) as {
	[K in keyof typeof selectCompatibleActions]: {
		input: (typeof selectCompatibleActions)[K]['output']
		output: (typeof selectCompatibleActions)[K]['output']['def']['element']
	}
}

export const createSelectTool = createTool(
	createGenericStatefulBlock({
		handleBlock(block) {
			console.log(block)
		},
		render(elements) {
			const first = elements[0]

			if (!first) throw 'No elements'

			return {
				component() {
					return <select />
				},
				initialState: first
			}
		},
		types: selectSchemas
	})
)
