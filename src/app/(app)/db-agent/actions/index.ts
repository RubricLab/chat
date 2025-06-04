import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'
import { getUsers } from './getUsers'

export const actions = {
	getUsers: createAction({
		schema: {
			input: { limit: z.number() },
			output: z.array(z.object({ id: z.string(), name: z.string().nullable(), email: z.string() }))
		},
		execute: getUsers,
		description: 'Get all users'
	})
}
