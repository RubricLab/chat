import z from 'zod'
import { createAction } from './lib/actions'

export const actions = {
	getRandomNumber: createAction({
		schema: {
			input: {},
			output: z.number()
		},
		execute: async () => {
			return Math.random()
		}
	})
}
