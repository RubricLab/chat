import { createChain } from '@rubriclab/chains'
import { z } from 'zod/v4'
import { blocks } from '~/website-agent/blocks'

const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

export const { definitions, compatabilities, drill } = createChain(blockSchemas, {
	strict: true,
	// Because we're using strict mode, but still want to allow the LLM to be able to write strings, numbers, and booleans, we add them as additional compatabilities.
	additionalCompatabilities: [
		{ type: z.string(), compatability: z.string() },
		{ type: z.number(), compatability: z.number() },
		{ type: z.boolean(), compatability: z.boolean() }
	]
})
