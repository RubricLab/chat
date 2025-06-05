import { createChain } from '@rubriclab/chains'
import { actions } from '../actions'
import { blocks } from '../blocks'

const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

export const { definitions, compatabilities, drill } = createChain(
	{ ...actionSchemas, ...blockSchemas },
	{ strict: true }
)
