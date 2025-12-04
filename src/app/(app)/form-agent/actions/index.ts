import { createAction } from '@rubriclab/actions'
import { z } from 'zod'
import { raw } from '../brands'
import { getUsers } from './getUsers'
import { sendEmail } from './sendEmail'
import { updateUser } from './updateUser'

export const user = z.object({
	email: z.string(),
	id: z.string()
})

export const actions = {
	getUsers: createAction({
		description: 'Get users',
		execute: getUsers,
		schema: {
			input: raw(z.null()),
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
	}),
	updateUser: createAction({
		description: 'Updates a user',
		execute: updateUser,
		schema: {
			input: z.object({
				name: z.string(),
				user
			}),
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
