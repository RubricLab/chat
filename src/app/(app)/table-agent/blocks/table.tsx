import { createTool } from '@rubriclab/agents'
import { createGenericBlock, REACT_NODE } from '@rubriclab/blocks'
import { brand, scope } from '@rubriclab/shapes'
import z from 'zod'
import { actionSchemas } from '~/table-agent/actions'
import { raw } from '../brands'
import { addBlock } from '.'

const tableCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_key, { output }]) => {
		return output.def.type === 'array' && output.def.element.def.type === 'object'
	})
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['output'] extends z.ZodArray
		? K
		: never]: (typeof actionSchemas)[K]
}

export const table = createGenericBlock({
	description: 'Render a text input',
	getSchema(typeKey) {
		return {
			input: z.object({
				columns: z.array(
					z.object({
						children: scope(
							REACT_NODE,
							`table<${typeKey}>`,
							Object.fromEntries(
								Object.entries(tableCompatibleActions[typeKey].output.def.element.def.shape).map(
									([field, value]) => [`$$.table<${typeKey}>.N.${field}`, value]
								)
							)
						),
						heading: raw(z.string())
					})
				),
				data: tableCompatibleActions[typeKey].output,
				query: brand('query', false)(z.literal(typeKey))
			})
		}
	},
	render: ({ data, columns, query }) => {
		return (
			<table>
				<thead>
					<tr>
						{columns.map((p, i) => {
							return <th key={`heading-${i.toString()}`}>{p.heading}</th>
						})}
					</tr>
				</thead>
				<tbody>
					{data.map((_row, i) => {
						return (
							<tr key={`row-${i.toString()}`}>
								{columns.map((p, i) => {
									return (
										<td key={`column-${i.toString()}`}>
											{p.children(
												Object.fromEntries(
													Object.entries(_row).map(([key, field]) => [`$$.table<${query}>.N.${key}`, field])
												)
											)}
										</td>
									)
								})}
							</tr>
						)
					})}
				</tbody>
			</table>
		)
	},
	types: tableCompatibleActions
})

export const instantiateTable = createTool({
	execute: async name => {
		addBlock({
			block: table.instantiate(name),
			name: `table<${name}>`
		})
		return null
	},
	schema: table.schema
})
