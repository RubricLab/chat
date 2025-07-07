import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'
import { getUsers } from './getUsers'
import { sendEmail } from './sendEmail'

export const user = z.object({
	email: z.string(),
	id: z.string()
})

export const actions = {
	getUsers: createAction({
		description: 'Get users',
		execute: getUsers,
		schema: {
			input: z.null(),
			output: z.array(user)
		}
	}),
	sendEmail: createAction({
		description: 'Send an email',
		execute: sendEmail,
		schema: {
			input: z.object({ body: z.string(), subject: z.string(), to: user }),
			output: z.null()
		}
	})
}

export const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

export type Actions = {
	[K in keyof typeof actions]: {
		action: K
		params: z.infer<(typeof actions)[K]['schema']['input']>
	}
}[keyof typeof actions]
