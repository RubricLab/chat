import { createAction } from '@rubriclab/actions'
import { z } from 'zod'
import { getUsers } from './getUsers'

export const actions = {
	getUsers: createAction({
		description: 'Get all users',
		execute: getUsers,
		schema: {
			input: z.object({
				limit: z.number()
			}),
			output: z.array(z.object({ email: z.string(), id: z.string(), name: z.string().nullable() }))
		}
	})
}
