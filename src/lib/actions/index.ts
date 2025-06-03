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
	execute: async () => [{ name: 'John Doe', email: 'john.doe@example.com' }],
	description: undefined
})

const stringify = createAction({
	schema: {
		input: {
			number: z.number()
		},
		output: z.string()
	},
	execute: async ({ number }) => number.toString(),
	description: undefined
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
	},
	description: undefined
})

export const actions = {
	getContacts,
	sendEmail,
	stringify
} as const

export type Actions = typeof actions
