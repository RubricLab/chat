import type { ReactNode } from 'react'
import { render } from '~/website-agent/blocks/client'
import { type Chain, drill } from './index'

export async function executeChain(chain: Chain) {
	return drill(
		chain,
		block => async props =>
			render({
				block,
				// biome-ignore lint/suspicious/noExplicitAny: will fix
				props: props as any
				// biome-ignore lint/suspicious/noExplicitAny: will fix
			}) as any
	) as ReactNode
}
