import { createAction, createActionsExecutor } from '@rubriclab/actions'
import { z } from 'zod'

export const Contact = z.object({ id: z.string(), email: z.string() })

export const actions = {
	sendEmail: createAction({
		schema: {
			input: z.object({ to: Contact, subject: z.string(), body: z.string() }),
			output: z.void()
		},
		execute: async ({ to, subject, body }) => {
			console.log(to, subject, body)
		}
	}),
	fetchEmails: createAction({
		schema: {
			input: z.object({}),
			output: z.array(z.object({ from: z.string(), subject: z.string(), body: z.string() }))
		},
		execute: async () => {
			return [
				{
					from: 'test@test.com',
					subject: 'test',
					body: 'test'
				}
			]
		}
	}),
	getContact: createAction({
		schema: {
			input: z.object({ id: z.string() }),
			output: Contact
		},
		execute: async ({ id }) => ({ id, email: 'john@test.com' })
	}),
	getContact2: createAction({
		schema: {
			input: z.object({ id: z.string() }),
			output: Contact
		},
		execute: async ({ id }) => ({ id, email: 'john@test.com' })
	}),
	getFavouriteColor: createAction({
		schema: {
			input: z.object({}),
			output: z.string()
		},
		execute: async () => 'red'
	})
}

export const { execute, schema, response_format } = createActionsExecutor(actions)

execute({
	action: 'sendEmail',
	params: {
		to: {
			action: 'getContact',
			params: {
				id: '1'
			}
		},
		subject: 'test',
		body: 'test'
	}
})
