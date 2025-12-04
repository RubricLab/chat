import { createAction } from '@rubriclab/actions'
import { z } from 'zod'
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
	abs: createAction({
		description: 'Calculate absolute value',
		execute: abs,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	ceil: createAction({
		description: 'Round up to the nearest integer',
		execute: ceil,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	cos: createAction({
		description: 'Calculate cosine (input in radians)',
		execute: cos,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	degreesToRadians: createAction({
		description: 'Convert degrees to radians',
		execute: degreesToRadians,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	divide: createAction({
		description: 'Divide a dividend by a divisor',
		execute: divide,
		schema: {
			input: z.object({ dividend: z.number(), divisor: z.number() }),
			output: z.number()
		}
	}),
	factorial: createAction({
		description: 'Calculate factorial (n!)',
		execute: factorial,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	floor: createAction({
		description: 'Round down to the nearest integer',
		execute: floor,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	getE: createAction({
		description: "Get the value of E (Euler's number)",
		execute: getE,
		schema: {
			input: z.null(),
			output: z.number()
		}
	}),
	getPi: createAction({
		description: 'Get the value of PI',
		execute: getPi,
		schema: {
			input: z.null(),
			output: z.number()
		}
	}),
	log: createAction({
		description: 'Calculate natural logarithm',
		execute: log,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	log10: createAction({
		description: 'Calculate base-10 logarithm',
		execute: log10,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	modulo: createAction({
		description: 'Get remainder when dividing dividend by divisor',
		execute: modulo,
		schema: {
			input: z.object({ dividend: z.number(), divisor: z.number() }),
			output: z.number()
		}
	}),
	multiply: createAction({
		description: 'Multiply a multiplicand by a multiplier',
		execute: multiply,
		schema: {
			input: z.object({ multiplicand: z.number(), multiplier: z.number() }),
			output: z.number()
		}
	}),
	negate: createAction({
		description: 'Negate a number (change its sign)',
		execute: negate,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	parse: createAction({
		description: 'Parse a string to a number',
		execute: parse,
		schema: {
			input: z.string(),
			output: z.number()
		}
	}),
	power: createAction({
		description: 'Raise base to the power of exponent',
		execute: power,
		schema: {
			input: z.object({ base: z.number(), exponent: z.number() }),
			output: z.number()
		}
	}),
	radiansToDegrees: createAction({
		description: 'Convert radians to degrees',
		execute: radiansToDegrees,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	round: createAction({
		description: 'Round to specified decimal places (default: 0)',
		execute: round,
		schema: {
			input: z.object({
				decimals: z.union([z.number(), z.null()]),
				value: z.number()
			}),
			output: z.number()
		}
	}),
	sin: createAction({
		description: 'Calculate sine (input in radians)',
		execute: sin,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	sqrt: createAction({
		description: 'Calculate square root',
		execute: sqrt,
		schema: {
			input: z.number(),
			output: z.number()
		}
	}),
	stringify: createAction({
		description: 'Stringify a number',
		execute: stringify,
		schema: {
			input: z.number(),
			output: z.string()
		}
	}),
	subtract: createAction({
		description: 'Subtract a subtrahend from a minuend',
		execute: subtract,
		schema: {
			input: z.object({ minuend: z.number(), subtrahend: z.number() }),
			output: z.number()
		}
	}),
	sum: createAction({
		description: 'Sum multiple numbers',
		execute: sum,
		schema: {
			input: z.array(z.number()),
			output: z.number()
		}
	}),
	tan: createAction({
		description: 'Calculate tangent (input in radians)',
		execute: tan,
		schema: {
			input: z.number(),
			output: z.number()
		}
	})
}

export const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }
