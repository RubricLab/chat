import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'

export const contact = z.object({
	name: z.string(),
	email: z.string()
})

const getContacts = createAction({
	schema: {
		input: {},
		output: z.array(contact)
	},
	execute: async () => [{ name: 'John Doe', email: 'john.doe@example.com' }]
})

const sendEmail = createAction({
	schema: {
		input: {
			to: contact,
			content: z.string()
		},
		output: z.string()
	},
	execute: async ({ content }) => {
		return `Sending email with content: ${content}`
	}
})

export const actions = {
	getContacts,
	sendEmail
}

export type Actions = typeof actions
