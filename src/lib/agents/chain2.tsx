import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createChain } from '@rubriclab/chains/lib/index3'
import { z } from 'zod/v4'
import env from '~/env'

const chainRegistry = z.registry<{ id: string }>()

const { nodes, compatabilities } = createChain({ nodes: {} })

Object.entries(compatabilities).map(([name, compat]) => {
	compat.register(chainRegistry, { id: name })
})

const chain = z.union(
	Object.entries(nodes).map(([name, node]) => {
		node.register(chainRegistry, { id: name })
		return node
	})
)

const responseFormat = createResponseFormat({
	name: 'chain',
	schema: z.object({
		chain
	}),
	registry: chainRegistry
})

console.dir(responseFormat, { depth: null })

const { executeAgent: executeChainAgent } = createAgent({
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: {},
	responseFormat
})

async function demo() {
	const { chain } = await executeChainAgent({
		openAIKey: env.OPENAI_API_KEY,
		messages: [
			{
				role: 'user',
				content: 'add 4 numbers together'
			}
		],
		onEvent: () => {}
	})

	console.dir(chain, { depth: null })
}

demo()
