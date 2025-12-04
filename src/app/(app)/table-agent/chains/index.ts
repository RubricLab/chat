import type { AnyBlock } from '@rubriclab/blocks'
import { createChain, createDrill } from '@rubriclab/chains'
import { z } from 'zod'
import { actionSchemas } from '../actions'

export function getChain<Blocks extends Record<string, AnyBlock>>(blocks: Blocks) {
	const blockSchemas = Object.fromEntries(
		Object.entries(blocks).map(([key, { schema }]) => [key, schema])
	) as { [K in keyof Blocks]: Blocks[K]['schema'] }

	const { definitions, compatibilities } = createChain(
		{ ...actionSchemas, ...blockSchemas },
		{
			strict: true
		}
	)
	const chain = z.union(Object.values(definitions))

	const { drill } = createDrill({ ...actionSchemas, ...blockSchemas })

	return { chain, compatibilities, definitions, drill }
}
