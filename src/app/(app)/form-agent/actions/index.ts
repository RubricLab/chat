import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'
import { getUsers } from './getUsers'
import { sendEmail } from './sendEmail'

export const user = z.object({
	id: z.string(),
	email: z.string()
})

export const actions = {
	sendEmail: createAction({
		schema: {
			input: { to: user, subject: z.string(), body: z.string() },
			output: z.undefined()
		},
		execute: sendEmail,
		description: 'Send an email'
	}),
	getUsers: createAction({
		schema: {
			input: { limit: z.number() },
			output: z.array(user)
		},
		execute: getUsers,
		description: 'Get users'
	})
}
