import { createTool } from '@rubriclab/agents'
import { createGenericBlock, REACT_NODE } from '@rubriclab/blocks'
import { type Scoped, scope } from '@rubriclab/shapes'
import z from 'zod/v4'
import { actionSchemas } from '~/table-agent/actions'
import { type Raw, raw } from '../brands'
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

const tableTypes = Object.fromEntries(
	Object.entries(tableCompatibleActions).map(([action, { output }]) => [
		action,
		{
			input: z.object({
				columns: z.array(
					z.object({
						children: scope(
							REACT_NODE,
							`table<${action}>`,
							Object.fromEntries(
								Object.entries(output.def.element.def.shape).map(([field, value]) => [
									`$$.table<${action}>.N.${field}`,
									value
								])
							)
						),
						heading: raw(z.string())
					})
				),
				data: output
			})
		}
	])
) as unknown as {
	[K in keyof typeof tableCompatibleActions]: {
		input: z.ZodObject<{
			data: (typeof tableCompatibleActions)[K]['output']
			columns: z.ZodArray<
				z.ZodObject<{
					heading: Raw<z.ZodString>
					children: Scoped<
						typeof REACT_NODE,
						`table<${K}>`,
						{
							[S in keyof (typeof tableCompatibleActions)[K]['output']['def']['element']['def']['shape'] as `$$.table<${K}>.N.${S & string}`]: (typeof tableCompatibleActions)[K]['output']['def']['element']['def']['shape'][S]
						}
					>
				}>
			>
		}>
	}
}

export const table = createGenericBlock({
	description: 'Render a text input',
	render: ({ data, columns }) => {
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
											{p.children({
												'$$.table<getUsers>.N.email': _row.email,
												'$$.table<getUsers>.N.id': _row.id,
												'$$.table<getUsers>.N.name': _row.name
											})}
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
	types: tableTypes
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
