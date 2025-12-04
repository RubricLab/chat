import { createAction } from '@rubriclab/actions'
import { brand } from '@rubriclab/shapes'
import { z } from 'zod'
import { getUsers } from './getUsers'

const raw = brand('raw', false)

const userId = brand('userId', true)(z.string())

export const actions = {
	deleteUser: createAction({
		description: 'Delete a user',
		execute: async ({ userId }) => {
			console.log(`DELETE ${userId}`)
			return null
		},
		schema: {
			input: z.object({
				userId
			}),
			output: z.null()
		}
	}),
	getUsers: createAction({
		description: 'Get all users',
		execute: getUsers,
		schema: {
			input: z.object({
				limit: raw(z.number())
			}),
			output: z.array(z.object({ email: z.string(), id: userId, name: z.string() }))
		}
	})
}

export const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }
