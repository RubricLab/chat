import { createAction } from '@rubriclab/actions'
import { z } from 'zod/v4'
import { abs } from './abs'
import { ceil } from './ceil'
import { cos } from './cos'
import { degreesToRadians } from './degreesToRadians'
import { divide } from './divide'
import { factorial } from './factorial'
import { floor } from './floor'
import { getE } from './getE'
import { getPi } from './getPi'
import { log } from './log'
import { log10 } from './log10'
import { modulo } from './modulo'
import { multiply } from './multiply'
import { negate } from './negate'
import { parse } from './parse'
import { power } from './power'
import { radiansToDegrees } from './radiansToDegrees'
import { round } from './round'
import { sin } from './sin'
import { sqrt } from './sqrt'
import { stringify } from './stringify'
import { subtract } from './subtract'
import { sum } from './sum'
import { tan } from './tan'

export const actions = {
	sum: createAction({
		schema: {
			input: z.array(z.number()),
			output: z.number()
		},
		execute: sum,
		description: 'Sum multiple numbers'
	}),
	subtract: createAction({
		schema: {
			input: z.object({ minuend: z.number(), subtrahend: z.number() }),
			output: z.number()
		},
		execute: subtract,
		description: 'Subtract a subtrahend from a minuend'
	}),
	multiply: createAction({
		schema: {
			input: z.object({ multiplicand: z.number(), multiplier: z.number() }),
			output: z.number()
		},
		execute: multiply,
		description: 'Multiply a multiplicand by a multiplier'
	}),
	divide: createAction({
		schema: {
			input: z.object({ dividend: z.number(), divisor: z.number() }),
			output: z.number()
		},
		execute: divide,
		description: 'Divide a dividend by a divisor'
	}),
	modulo: createAction({
		schema: {
			input: z.object({ dividend: z.number(), divisor: z.number() }),
			output: z.number()
		},
		execute: modulo,
		description: 'Get remainder when dividing dividend by divisor'
	}),
	power: createAction({
		schema: {
			input: z.object({ base: z.number(), exponent: z.number() }),
			output: z.number()
		},
		execute: power,
		description: 'Raise base to the power of exponent'
	}),
	sqrt: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: sqrt,
		description: 'Calculate square root'
	}),
	abs: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: abs,
		description: 'Calculate absolute value'
	}),
	negate: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: negate,
		description: 'Negate a number (change its sign)'
	}),
	round: createAction({
		schema: {
			input: z.object({ value: z.number(), decimals: z.union([z.number(), z.null()]) }),
			output: z.number()
		},
		execute: round,
		description: 'Round to specified decimal places (default: 0)'
	}),
	floor: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: floor,
		description: 'Round down to the nearest integer'
	}),
	ceil: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: ceil,
		description: 'Round up to the nearest integer'
	}),
	factorial: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: factorial,
		description: 'Calculate factorial (n!)'
	}),
	sin: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: sin,
		description: 'Calculate sine (input in radians)'
	}),
	cos: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: cos,
		description: 'Calculate cosine (input in radians)'
	}),
	tan: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: tan,
		description: 'Calculate tangent (input in radians)'
	}),
	log: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: log,
		description: 'Calculate natural logarithm'
	}),
	log10: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: log10,
		description: 'Calculate base-10 logarithm'
	}),
	getPi: createAction({
		schema: {
			input: z.null(),
			output: z.number()
		},
		execute: getPi,
		description: 'Get the value of PI'
	}),
	getE: createAction({
		schema: {
			input: z.null(),
			output: z.number()
		},
		execute: getE,
		description: 'Get the value of E (Euler\'s number)'
	}),
	degreesToRadians: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: degreesToRadians,
		description: 'Convert degrees to radians'
	}),
	radiansToDegrees: createAction({
		schema: {
			input: z.number(),
			output: z.number()
		},
		execute: radiansToDegrees,
		description: 'Convert radians to degrees'
	}),
	stringify: createAction({
		schema: {
			input: z.number(),
			output: z.string()
		},
		execute: stringify,
		description: 'Stringify a number'
	}),
	parse: createAction({
		schema: {
			input: z.string(),
			output: z.number()
		},
		execute: parse,
		description: 'Parse a string to a number'
	})
}

export const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }
