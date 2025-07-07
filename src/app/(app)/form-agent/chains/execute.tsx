'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { type Actions, actions } from '../actions'
import { execute } from '../actions/server'
import { type Blocks, blocks } from '../blocks'
import { render } from '../blocks/client'
import { type Chain, drill } from './index'

async function executeChain(chain: Chain) {
	// @ts-expect-error TECH DEBT
	return drill(chain, node => {
		if (node in actions) {
			return async params => {
				const action = {
					action: node,
					params
				} as Actions
				const result = await execute(action)
				if (!result) throw 'no result'
				return result
			}
		}
		if (node in blocks) {
			return async props => {
				const block = {
					block: node,
					props
				} as Blocks
				const result = await render(block)
				if (!result) throw 'no result'
				return result
			}
		}
		throw 'bad node'
	}) as ReactNode
}

export function RenderChain({ chain }: { chain: Chain }) {
	const [dom, setDom] = useState<ReactNode>()

	useEffect(() => {
		;(async () => {
			const executed = await executeChain(chain)
			setDom(executed)
		})()
	}, [chain])

	return dom
}
