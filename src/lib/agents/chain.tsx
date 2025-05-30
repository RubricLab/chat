import { createAction } from '@rubriclab/actions'
import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createChain } from '@rubriclab/chains'
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

const { definitions, compatabilities } = createChain({
	addNumbers: addNumbers.schema,
	stringify: stringify.schema
})

const defs = Object.entries(definitions).map(([name, { definition }]) => {
	definition.register(chainRegistry, { id: name })
	return definition
})

const comps = Object.entries(compatabilities).map(([node, input]) => {
	Object.entries(input).map(([key, value]) => {
		console.log(key, value)
		try {
			value.zod.register(chainRegistry, { id: JSON.stringify(value.shape) })
		} catch (e) {
			console.error(e)
		}
	})
})

const responseFormat = createResponseFormat({
	name: 'chain',
	schema: z.object({
		chain: z.union(defs)
	}),
	registry: chainRegistry
})

console.dir(responseFormat, { depth: null })

export const {
	executeAgent: executeChainAgent,
	eventTypes: chainAgentEventTypes,
	__Event
} = createAgent({
	model: 'o4-mini',
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: {},
	responseFormat
})

const out = await executeChainAgent({
	openAIKey: env.OPENAI_API_KEY,
	messages: [
		{
			role: 'user',
			content: 'add 6 numbers together and then stringify the result'
		}
	],
	onEvent: () => {}
})

console.dir(out, { depth: null })
