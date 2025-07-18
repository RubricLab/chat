import { createDrill } from '@rubriclab/chains'
import type { ReactNode } from 'react'
import { render } from '~/table-agent/blocks/client'

const { drill } = createDrill({})

export async function executeChain(chain: unknown) {
	return drill(
		chain,
		block => async props =>
			render({
				block,
				props
			}) as any
	) as ReactNode
}
