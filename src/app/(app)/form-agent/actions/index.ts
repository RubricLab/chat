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
			input: { limit: z.number() },
			output: z.array(user)
		}
	}),
	sendEmail: createAction({
		description: 'Send an email',
		execute: sendEmail,
		schema: {
			input: { body: z.string(), subject: z.string(), to: user },
			output: z.undefined()
		}
	})
}
