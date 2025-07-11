import { createTool } from '@rubriclab/agents'
import { createGenericStatefulBlock } from '@rubriclab/blocks'
import type { z } from 'zod/v4'
import { actionSchemas } from '../../actions'
import { addBlock } from '..'

const selectCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_key, { output }]) => {
		return output.def.type === 'array'
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

export const genericSelectBlock = createGenericStatefulBlock({
	description:
		'An action that instantiates a new select block and adds it to the schema. Selects must be instantiated with an array-producing-action that they are responsible for offering a user a selection of. The instantiated block takes as input the output of the array-producing-action and outputs React and an element of that array as state.',
	handleBlock({ type, block }) {
		addBlock({ block, name: `genericSelect<${type}>` })
	},
	render(elements) {
		const first = elements[0]

		if (!first) throw 'No elements'

		return {
			component({ emit }) {
				return (
					<select onChange={e => emit(JSON.parse(e))}>
						{elements.map((element, _i) => {
							return <option value={JSON.stringify(element)}>{JSON.stringify(element)}</option>
						})}
					</select>
				)
			},
			initialState: first
		}
	},
	types: selectSchemas
})

export const instantiateSelectTool = createTool(genericSelectBlock)
