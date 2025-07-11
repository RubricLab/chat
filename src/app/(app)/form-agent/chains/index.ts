import { createChain, createDrill } from '@rubriclab/chains'
import { z } from 'zod/v4'
import { actionSchemas } from '../actions'
import type { AnyBlock } from '../blocks'

export function getChain<Blocks extends Record<string, AnyBlock>>(blocks: Blocks) {
	const blockSchemas = Object.fromEntries(
		Object.entries(blocks).map(([key, { schema }]) => [key, schema])
	) as { [K in keyof Blocks]: Blocks[K]['schema'] }

	const { definitions, compatibilities } = createChain(
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
				},
				{
					compatibilities: [z.literal('sendEmail')],
					type: z.literal('sendEmail')
				},
				{
					compatibilities: [z.literal('getContacts')],
					type: z.literal('getContacts')
				},
				{
					compatibilities: [z.literal('updateUser')],
					type: z.literal('updateUser')
				}
			],
			strict: true
		}
	)

	const chain = z.union(Object.values(definitions))

	const { drill } = createDrill({ ...actionSchemas, ...blockSchemas })

	return { chain, compatibilities, definitions, drill }
}
