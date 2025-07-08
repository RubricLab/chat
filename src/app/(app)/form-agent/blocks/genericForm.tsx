import { createTool } from '@rubriclab/agents'
import { createGenericBlock } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { actionSchemas } from '../actions'
import { execute } from '../actions/server'

const formTypes = Object.fromEntries(
	Object.entries(actionSchemas)
		.filter(([_, { input }]) => {
			return input !== null
		})
		.map(([key, { input }]) => [
			key,
			{
				input: z.strictObject({
					fields: input,
					mutation: z.literal(key)
				}),
				output: z.null()
			}
		])
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['input'] extends z.ZodNull
		? never
		: K]: {
		input: z.ZodObject<
			{ mutation: z.ZodLiteral<K>; fields: (typeof actionSchemas)[K]['input'] },
			$strict
		>
		output: z.ZodNull
	}
}

export const instantiateFormTool = createTool(
	createGenericBlock({
		handleBlock(block) {
			console.log(block)
		},
		render({ mutation, fields }) {
			async function ex() {
				await execute({ action: mutation, params: fields })
			}
			return <form onSubmit={ex}>HEY</form>
		},
		types: formTypes
	})
)
