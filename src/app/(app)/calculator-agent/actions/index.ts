import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'
import { add } from './add'
import { multiply } from './multiply'
import { parse } from './parse'
import { stringify } from './stringify'
import { subtract } from './subtract'
import { sum } from './sum'

export const actions = {
	add: createAction({
		schema: {
			input: { a: z.number(), b: z.number() },
			output: z.number()
		},
		execute: add,
		description: 'Add two numbers'
	}),
	sum: createAction({
		schema: {
			input: { numbers: z.array(z.number()) },
			output: z.number()
		},
		execute: sum,
		description: 'Add two numbers'
	}),
	subtract: createAction({
		schema: {
			input: { a: z.number(), b: z.number() },
			output: z.number()
		},
		execute: subtract,
		description: 'Subtract two numbers'
	}),
	multiply: createAction({
		schema: {
			input: { a: z.number(), b: z.number() },
			output: z.number()
		},
		execute: multiply,
		description: 'Multiply two numbers'
	}),
	stringify: createAction({
		schema: {
			input: { a: z.number() },
			output: z.string()
		},
		execute: stringify,
		description: 'Stringify a number'
	}),
	parse: createAction({
		schema: {
			input: { a: z.string() },
			output: z.number()
		},
		execute: parse,
		description: 'Parse a string to a number'
	})
}

export const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }
