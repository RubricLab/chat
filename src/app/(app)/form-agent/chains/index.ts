import { createChain, createDrill } from '@rubriclab/chains'
import { z } from 'zod/v4'
import { actionSchemas } from '../actions'
import { blockSchemas } from '../blocks'

export const { definitions, compatibilities } = createChain(
	{ ...actionSchemas, ...blockSchemas },
	{
		additionalCompatibilities: [
			{
				compatibilities: [z.null()],
				type: z.null()
			},
			{
				compatibilities: [z.literal('THIS IS A BUG')],
				type: z.string()
			}
		],
		strict: true
	}
)

export const chain = z.union(Object.values(definitions))

export type Chain = z.infer<typeof chain>

export const { drill } = createDrill({ ...actionSchemas, ...blockSchemas })
