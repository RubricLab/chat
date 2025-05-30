import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { type Actions, actions } from '~/actions'
import { execute } from '~/actions/server'
import type { UIEventTypes } from '~/agents/ui'
import { type Blocks, blocks } from '~/blocks'
import { render } from '~/blocks/client'

async function ExecNode<Node extends UIEventTypes['message']['chain'][number]>({
	node
}: {
	node: Node
}) {
	if (node.node in blocks) {
		type Block = Blocks[Node['node'] extends keyof Blocks ? Node['node'] : never]
		const block = blocks[node.node as keyof Blocks] as Block

		if (node.input instanceof Object && 'node' in node.input) {
			return drill({ chain: node.input.node })
		}

		const input = z.object(block.schema.input).parse(node.input) as z.infer<
			z.ZodObject<Block['schema']['input'], $strict>
		>

		const output = render({
			block: node.node as Node['node'] extends keyof Blocks ? Node['node'] : never,
			props: input
		})

		return output
	}
	if (node.node in actions) {
		type Action = Actions[Node['node'] extends keyof Actions ? Node['node'] : never]
		const action = actions[node.node as keyof Actions] as Action

		const input = z.object(action.schema.input).parse(node.input) as z.infer<
			z.ZodObject<Action['schema']['input'], $strict>
		>

		const output = await execute({
			action: node.node as Node['node'] extends keyof Actions ? Node['node'] : never,
			params: input
		})

		return JSON.stringify(output)
	}

	return <div>unknown node {node.node}</div>
}

export async function drill<Chain extends UIEventTypes['message']['chain']>({
	chain
}: {
	chain: Chain
}) {
	const output = await Promise.all(
		chain.map(async (node, i) => {
			const output = await ExecNode({ node })
			return <div key={`node_${i}`}>{output}</div>
		})
	)
	return <div>{output}</div>
}
