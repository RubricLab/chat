'use client'

import { type ReactNode, useState } from 'react'
import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { type Actions, actions } from '~/actions'
import { execute } from '~/actions/server'
import type { UIEventTypes } from '~/agents/ui'
import { type Blocks, blocks } from '~/blocks'
import { render } from '~/blocks/client'

const kiddos: ReactNode[] = []

async function ExecNode<Node extends UIEventTypes['message']['chain']>({
	node
}: {
	node: Node
}) {
	const [state, setState] = useState<number>(1)

	console.log('HERE')

	console.dir(node, { depth: null })

	if (node.node in blocks) {
		console.log('BLOCK', node)
		type Block = Blocks[Node['node'] extends keyof Blocks ? Node['node'] : never]
		const block = blocks[node.node as keyof Blocks] as Block

		const newInput = Object.fromEntries(
			await Promise.all(
				Object.entries(node.input).map(async ([key, value]) => {
					if (value instanceof Object && 'node' in value) {
						console.log('DRILLING', value.node)
						return [key, await ExecNode({ node: value })]
					}
					return [key, value]
				})
			)
		) as {
			[K in keyof Node['input']]: Node['input'][K]
		}

		console.log(newInput)

		const input = z.object(block.schema.input).parse(newInput) as z.infer<
			z.ZodObject<Block['schema']['input'], $strict>
		>

		// let state: z.infer<Block['schema']['output']> = 1 as never

		const output = render({
			block: node.node as Node['node'] extends keyof Blocks ? Node['node'] : never,
			props: input,
			emit: output => {
				setState(output)
			}
		})

		kiddos.push(output)

		return state
	}
	if (node.node in actions) {
		console.log('ACTION')
		type Action = Actions[Node['node'] extends keyof Actions ? Node['node'] : never]
		const action = actions[node.node as keyof Actions] as Action

		const newInput = Object.fromEntries(
			await Promise.all(
				Object.entries(node.input).map(async ([key, value]) => {
					if (value instanceof Object && 'node' in value) {
						console.log('DRILLING ACTION', value)
						return [key, await ExecNode({ node: value })]
					}
					return [key, value]
				})
			)
		)
		console.dir(newInput)

		const input = z.object(action.schema.input).parse(newInput) as z.infer<
			z.ZodObject<Action['schema']['input'], $strict>
		>

		const output = await execute({
			action: node.node as Node['node'] extends keyof Actions ? Node['node'] : never,
			params: input
		})

		return output
	}

	return <div>unknown node {node.node}</div>
}

export async function drill<Chain extends UIEventTypes['message']['chain']>({
	chain
}: {
	chain: Chain
}) {
	// const output = await Promise.all(
	// 	chain.map(async (node, i) => {
	const output = await ExecNode({ node: chain })
	return (
		<>
			{kiddos.map((k, i) => (
				<div key={i}>{k}</div>
			))}
			{JSON.stringify(output)}
		</>
	)
	// return <div>{output}</div>
	// 	})
	// )
	// return <div>{output}</div>
}
