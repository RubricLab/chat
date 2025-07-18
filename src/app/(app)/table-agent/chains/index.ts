import { createDrill } from '@rubriclab/chains'
import { createChain } from '@rubriclab/chains/lib2/chains'
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
			strict: false
		}
	)
	const chain = z.union(Object.values(definitions))

	const { drill } = createDrill({ ...actionSchemas, ...blockSchemas })

	return { chain, compatibilities, definitions, drill }
}
