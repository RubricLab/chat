import { createTool } from '@rubriclab/agents'
import { createGenericStatefulBlock } from '@rubriclab/blocks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rubriclab/ui'
import { z } from 'zod'
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

export const select = createGenericStatefulBlock({
	description:
		'An action that instantiates a new select block and adds it to the schema. Selects must be instantiated with an array-producing-action that they are responsible for offering a user a selection of. The instantiated block takes as input the output of the array-producing-action and outputs React and an element of that array as state.',
	getSchema(typeKey) {
		const { output } = selectCompatibleActions[typeKey]
		return {
			input: z.strictObject({
				data: output,
				label: raw(
					z.enum(Object.fromEntries(Object.keys(output.def.element.def.shape).map(k => [k, k])))
				)
			}),
			output: output.def.element
		}
	},
	render({ data, label }) {
		const first = data[0]

		if (!first) throw 'No elements'

		return {
			component({ emit }) {
				return (
					<Select
						onValueChange={e => {
							emit(JSON.parse(e))
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder={first[label as keyof typeof first].toString()} />
						</SelectTrigger>
						<SelectContent>
							{data.map((element, i) => {
								return (
									<SelectItem key={`option-${i.toString()}`} value={JSON.stringify(element)}>
										{element[label as keyof typeof element].toString()}
									</SelectItem>
								)
							})}
						</SelectContent>
					</Select>
				)
			},
			initialState: first
		}
	},
	types: selectCompatibleActions
})

export const instantiateSelect = createTool({
	async execute(name) {
		addBlock({ block: select.instantiate(name), name: `select<${name}>` })
		return null
	},
	schema: select.schema
})
