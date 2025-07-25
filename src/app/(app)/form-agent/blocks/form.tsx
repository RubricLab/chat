import { createTool } from '@rubriclab/agents'
import { createGenericBlock, stateful } from '@rubriclab/blocks'
import { brand } from '@rubriclab/shapes'
import { z } from 'zod/v4'
import { actionSchemas } from '../actions'
import { execute } from '../actions/server'
import { raw } from '../brands'
import { addBlock } from '.'

const formCompatibleActions = Object.fromEntries(
	Object.entries(actionSchemas).filter(([_, { input }]) => {
		return input instanceof z.ZodObject
	})
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['input'] extends z.ZodObject
		? K
		: never]: (typeof actionSchemas)[K]
}

export const form = createGenericBlock({
	description:
		'An action that instantiates a new form block and adds it to the schema. Forms must be instantiated with an action that they are responsible for mutating, before they can be chained and rendered.',
	getSchema(typeKey) {
		const { input } = formCompatibleActions[typeKey]
		return {
			input: z.strictObject({
				fields: z.strictObject(
					Object.fromEntries(Object.entries(input.shape).map(([key, type]) => [key, stateful(type)]))
				),
				mutation: brand('mutation', false)(z.literal(typeKey)),
				title: raw(z.string())
			})
		}
	},
	render({ title, mutation, fields }) {
		async function exec() {
			const vals = Object.fromEntries(
				Object.entries(fields).map(([key, [getState, _]]) => [
					key,
					(getState as unknown as () => typeof getState)()
				])
			)
			// biome-ignore lint/suspicious/noExplicitAny:_
			await execute({ action: mutation, params: vals as any })
		}
		return (
			<form>
				<h2>{title}</h2>
				{Object.entries(fields).map(([key, [_, react]]) => {
					return (
						<div key={key}>
							<p>{key}</p>
							<br />
							{react}
						</div>
					)
				})}
				<button type="button" onClick={exec}>
					submit
				</button>
			</form>
		)
	},
	types: formCompatibleActions
})

export const instantiateForm = createTool({
	async execute(name) {
		addBlock({ block: form.instantiate(name), name: `form<${name}>` })
		return null
	},
	schema: form.schema
})
