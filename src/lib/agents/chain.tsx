import { createAction } from '@rubriclab/actions'
import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createChain, stableHash } from '@rubriclab/chains'
import { z } from 'zod/v4'
import env from '~/env'

export const chainRegistry = z.registry<{ id: string }>()

const addNumbers = createAction({
	schema: {
		input: {
			number1: z.number(),
			number2: z.number()
		},
		output: z.number()
	},
	execute: async ({ number1, number2 }) => {
		return number1 + number2
	}
})

const stringify = createAction({
	schema: {
		input: {
			number: z.number()
		},
		output: z.string()
	},
	execute: async ({ number }) => {
		return number.toString()
	}
})

const { nodes } = createChain({
	addNumbers,
	stringify
})

const t = z.union(nodes)

const zoo: z.infer<typeof t> = {
	node: 'addNumbers',
	input: {
		number1: {
			node: 'addNumbers',
			input: {
				number1: 1,
				number2: 2
			}
		},
		number2: {
			node: 'addNumbers',
			input: {
				number1: 1,
				number2: 2
			}
		}
	}
}

// const registeredNodes = await Promise.all(
// 	nodes.map(async node => {
// 		node.register(chainRegistry, { id: node.shape.node.value })
// 		await Promise.all(
// 			Object.entries(node.shape.input.shape).map(async ([key, value]) => {
// 				const id = `${await stableHash(value)}`
// 				try {
// 					value.register(chainRegistry, { id })
// 				} catch (e) {
// 					console.error(e)
// 				}
// 			})
// 		)

// 		return node
// 	})
// )

const responseFormat = createResponseFormat({
	name: 'chain',
	schema: z.object({
		chain: z.union(nodes)
	}),
	registry: chainRegistry
})

console.dir(responseFormat, { depth: null })

export const {
	executeAgent: executeChainAgent,
	eventTypes: chainAgentEventTypes,
	__Event
} = createAgent({
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: {},
	responseFormat
})

const out = await executeChainAgent({
	openAIKey: env.OPENAI_API_KEY,
	messages: [
		{
			role: 'user',
			content: 'add 4 numbers together'
		}
	],
	onEvent: () => {}
})

console.dir(out, { depth: null })
