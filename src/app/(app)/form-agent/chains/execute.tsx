'use client'

import { createDrill } from '@rubriclab/chains'
import { type ReactNode, useEffect, useState } from 'react'
import { type Actions, actions } from '../actions'
import { execute } from '../actions/server'
import { staticBlocks } from '../blocks'
import { render } from '../blocks/client'
import { genericBlocks } from '../blocks/generics'

const { drill } = createDrill({})

async function executeChain(chain: unknown) {
	return drill(chain, node => {
		console.log('here', node)
		if (node in actions) {
			console.log('action hit', node)
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
		if (node in staticBlocks) {
			console.log('block hit', node)
			return async props => {
				const block = {
					block: node,
					props
				}
				const result = await render(block)
				if (!result) throw 'no result'
				return result
			}
		}
		if ((node as string).split('<')[0]?.length) {
			console.log('generic hit')
			console.log('IN!!!!', node)
			try {
				return async props => {
					console.log('IN!!!!', node, props)

					const genericKey = (node as string).split('<')[0] as keyof typeof genericBlocks
					console.log(genericKey)
					console.log('IN2!!!!')

					const generic = genericBlocks[genericKey]
					console.log(generic.description)
					console.log('IN3!!!!')

					const inner = (node as string).split('<')[1]?.split('>')[0]
					if (!inner) throw 'fuck'
					const instantiated = await generic.instantiate(inner)
					console.log('IN4!!!!')

					console.log(instantiated.type)
					const result = await instantiated.block.render(props)
					if (!result) throw 'no result'
					return result
				}
			} catch (e) {
				console.error(e)
			}
		}
		throw `bad node - ${node}`
	}) as ReactNode
}

export function RenderChain({ chain }: { chain: unknown }) {
	const [dom, setDom] = useState<ReactNode>()

	useEffect(() => {
		;(async () => {
			const executed = await executeChain(chain)
			setDom(executed)
		})()
	}, [chain])

	return dom
}
