import { createChain, createDrill } from '@rubriclab/chains'
import { z } from 'zod'
import { blocks } from '~/website-agent/blocks'

const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

const { definitions, compatibilities } = createChain(blockSchemas, {
	strict: true
})

export { definitions, compatibilities }

export const chain = z.union(Object.values(definitions))

export type Chain = z.infer<typeof chain>

export const { drill } = createDrill(blockSchemas)
