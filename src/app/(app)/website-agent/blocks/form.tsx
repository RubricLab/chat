import { createGenericBlock, stateful } from '@rubriclab/blocks'
import { type Branded, brand } from '@rubriclab/shapes'

import z from 'zod/v4'
import type { $strict } from 'zod/v4/core'

const formCompatibleActions = {
	createUser: {
		input: z.strictObject({ name: z.string() }),
		output: z.null()
	},
	updateUser: {
		input: z.strictObject({ id: z.number() }),
		output: z.null()
	}
}

type Stateful<Type extends z.ZodObject> = z.ZodObject<
	{
		[K in keyof Type['shape']]: ReturnType<typeof stateful<Type['shape'][K]>>
	},
	$strict
>

type Actions = typeof formCompatibleActions

const formTypes = Object.fromEntries(
	Object.entries(formCompatibleActions).map(([action, { input }]) => [
		action,
		{
			input: z.strictObject({
				fields: z.strictObject(
					Object.fromEntries(Object.entries(input.shape).map(([key, type]) => [key, stateful(type)]))
				),
				mutation: brand('mutation', false)(z.literal(action))
			})
		}
	])
) as {
	[ActionKey in keyof Actions]: {
		input: z.ZodObject<
			{
				fields: Stateful<Actions[ActionKey]['input']>
				mutation: Branded<z.ZodLiteral<ActionKey>, 'mutation', false>
			},
			$strict
		>
	}
}

export const genericFormBlock = createGenericBlock({
	description:
		'An action that instantiates a new form block and adds it to the schema. Forms must be instantiated with an action that they are responsible for mutating, before they can be chained and rendered.',
	render({ mutation, fields }) {
		function exec() {
			const vals = Object.fromEntries(
				Object.entries(fields).map(([key, [getState, _]]) => [key, getState()])
			)
			alert(`execute ${mutation} ${JSON.stringify(vals)}`)
		}
		return (
			<form>
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
