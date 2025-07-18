import { createTool } from '@rubriclab/agents'
import { createGenericBlock, stateful } from '@rubriclab/blocks'
import { type Branded, brand } from '@rubriclab/shapes'
import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { actionSchemas } from '../actions'
import { execute } from '../actions/server'
import { type Raw, raw } from '../brands'
// import { execute } from "../../actions/server";
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

type StatefulObject<Type extends z.ZodObject> = z.ZodObject<
	{
		[K in keyof Type['shape']]: ReturnType<typeof stateful<Type['shape'][K]>>
	},
	$strict
>

const formTypes = Object.fromEntries(
	Object.entries(formCompatibleActions).map(([action, { input }]) => [
		action,
		{
			input: z.strictObject({
				fields: z.strictObject(
					Object.fromEntries(Object.entries(input.shape).map(([key, type]) => [key, stateful(type)]))
				),
				mutation: brand('mutation', false)(z.literal(action)),
				title: raw(z.string())
			})
		}
	])
) as {
	[ActionKey in keyof typeof formCompatibleActions]: {
		input: z.ZodObject<
			{
				title: Raw<z.ZodString>
				fields: StatefulObject<(typeof formCompatibleActions)[ActionKey]['input']>
				mutation: Branded<z.ZodLiteral<ActionKey>, 'mutation', false>
			},
			$strict
		>
	}
}

export const form = createGenericBlock({
	description:
		'An action that instantiates a new form block and adds it to the schema. Forms must be instantiated with an action that they are responsible for mutating, before they can be chained and rendered.',
	render({ title, mutation, fields }) {
		async function exec() {
			const vals = Object.fromEntries(
				Object.entries(fields).map(([key, [getState, _]]) => [
					key,
					// TECH DEBT
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
	types: formTypes
})

export const instantiateForm = createTool({
	async execute(name) {
		addBlock({ block: form.instantiate(name), name: `form<${name}>` })
		return null
	},
	schema: form.schema
})
