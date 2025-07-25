import { type ReactNode, useEffect, useState } from 'react'
import { render } from '~/table-agent/blocks/client'
import { actions } from '../actions'
import { execute } from '../actions/server'
import { getBlocks } from '../blocks'
import { getChain } from '.'

export async function executeChain(chain: { node: string; input: unknown }) {
	const { drill } = getChain(getBlocks())

	return drill(chain, node => {
		// biome-ignore lint/suspicious/noExplicitAny: tech debt
		if (node in actions) return params => execute({ action: node as any, params: params as any })
		// biome-ignore lint/suspicious/noExplicitAny: tech debt
		return props => render({ block: node as any, props: props as any })
	})
}

export function RenderChain({ chain }: { chain: { node: string; input: unknown } }) {
	const [dom, setDom] = useState<ReactNode>()

	useEffect(() => {
		;(async () => {
			const executed = await executeChain(chain)
			try {
				setDom(executed as ReactNode)
			} catch (_) {
				setDom('resulting component not react')
			}
		})()
	}, [chain])

	return dom
}
