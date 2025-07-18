import { createTool } from '@rubriclab/agents'
import { createGenericBlock } from '@rubriclab/blocks'
import { scope } from '@rubriclab/shapes'
import z from 'zod/v4'
import { actionSchemas } from '~/table-agent/actions'
import { addBlock, REACT_NODE } from '..'

const tableCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_key, { output }]) => {
		return output.def.type === 'array'
	})
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['output'] extends z.ZodArray
		? K
		: never]: (typeof actionSchemas)[K]
}

export const genericTableBlock = createGenericBlock({
	description: 'Render a text input',
	getSchema(actionKey) {
		const action = tableCompatibleActions[actionKey]
		return {
			input: z.object({
				columns: scope(z.array(REACT_NODE), {
					context: Object.fromEntries(
						Object.entries(action.output._zod.def.element._zod.def.shape).map(([field, value]) => [
							`$$.table<${action}>.N.${field}`,
							value
						])
					),
					name: `table<${actionKey}>`
				}),
				data: action.output
			})
		}
	},
	render: props => {
		return (
			<table>
				{props.columns.map(p => {
					return <>{p}</>
				})}
			</table>
		)
	},
	types: tableCompatibleActions
})

export const instantiateTableTool = createTool({
	execute: async name => {
		addBlock({
			block: genericTableBlock.instantiate(name),
			name: `table<${name}>`
		})
		return null
	},
	schema: genericTableBlock.schema
})
