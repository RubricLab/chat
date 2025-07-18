import { createTool } from '@rubriclab/agents'
import { createGenericStatefulBlock } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { actionSchemas } from '../actions'
import { raw } from '../brands'
import { addBlock } from '.'

const selectCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_key, { output }]) => {
		return output.def.type === 'array' && output.def.element.def.type === 'object'
	})
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['output'] extends z.ZodArray<
		infer Inner
	>
		? Inner extends z.ZodObject
			? K
			: never
		: never]: (typeof actionSchemas)[K]
}

const selectTypes = Object.fromEntries(
	Object.entries(selectCompatibleActions).map(([key, { output }]) => [
		key,
		{
			input: z.strictObject({
				data: output,
				label: raw(
					z.enum(Object.fromEntries(Object.keys(output.def.element.def.shape).map(k => [k, k])))
				)
			}),
			output: output.def.element
		}
	])
) as {
	[K in keyof typeof selectCompatibleActions]: {
		input: z.ZodObject<
			{
				data: (typeof selectCompatibleActions)[K]['output']
				label: ReturnType<typeof raw<z.ZodEnum>>
			},
			$strict
		>
		output: (typeof selectCompatibleActions)[K]['output']['element']
	}
}

export const select = createGenericStatefulBlock({
	description:
		'An action that instantiates a new select block and adds it to the schema. Selects must be instantiated with an array-producing-action that they are responsible for offering a user a selection of. The instantiated block takes as input the output of the array-producing-action and outputs React and an element of that array as state.',
	render({ data, label }) {
		const first = data[0]

		if (!first) throw 'No elements'

		return {
			component({ emit }) {
				return (
					<select onChange={e => emit(JSON.parse(e.target.value))}>
						{data.map((element, i) => {
							return (
								<option key={`option-${i.toString()}`} value={JSON.stringify(element)}>
									{element[label as keyof typeof element].toString()}
								</option>
							)
						})}
					</select>
				)
			},
			initialState: first
		}
	},
	types: selectTypes
})

export const instantiateSelect = createTool({
	async execute(name) {
		addBlock({ block: select.instantiate(name), name: `select<${name}>` })
		return null
	},
	schema: select.schema
})
