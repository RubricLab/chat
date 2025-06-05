import { createChain } from '@rubriclab/chains'
import { actions } from '../actions'

const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

export const { definitions, compatabilities, drill } = createChain(actionSchemas, { strict: false })
