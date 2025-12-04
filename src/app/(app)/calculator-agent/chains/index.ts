/** biome-ignore-all assist/source/useSortedKeys: key sorting makes the demo harder to understand */

import { createChain, createDrill } from '@rubriclab/chains'
import { z } from 'zod'
import { actionSchemas } from '../actions'

export const { definitions, compatibilities } = createChain(actionSchemas, {
	strict: false
})

export const chain = z.union(Object.values(definitions))

export type Chain = z.infer<typeof chain>

export const { drill } = createDrill(actionSchemas)
