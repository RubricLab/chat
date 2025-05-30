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

const sendEmail = createAction({
	schema: {
		input: {
			contact: z.object({
				name: z.string(),
				email: z.string()
			}),
			message: z.string()
		},
		output: z.string()
	},
	execute: async ({ contact, message }) => {
		return `Sending email to ${contact.email} with message: ${message}`
	}
})

const { definitions, compatabilities } = createChain({
	addNumbers: addNumbers.schema,
	stringify: stringify.schema,
	sendEmail: sendEmail.schema
})

for (const definition of definitions) {
	definition.register(chainRegistry, { id: definition.shape.node.value })
}

const comps = Object.entries(compatabilities).map(([_, input]) => {
	Object.entries(input).map(([key, value]) => {
		console.log(key, value.shape)
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
		chain: z.union(definitions)
	}),
	registry: chainRegistry
})

console.dir(responseFormat, { depth: null })

export const {
	executeAgent: executeChainAgent,
	eventTypes: chainAgentEventTypes,
	__Event
} = createAgent({
	model: 'gpt-4.1',
	systemPrompt: '',
	tools: {},
	responseFormat
})

const { chain } = await executeChainAgent({
	openAIKey: env.OPENAI_API_KEY,
	messages: [
		{
			role: 'user',
			content: 'send an email to john@doe.com with the message "hello"'
		}
	],
	onEvent: () => {}
})

switch (chain.node) {
	case 'addNumbers':
		console.log(chain.input.number1)
		break
	case 'stringify':
		console.log(chain.input.number)
		if (chain.input.number instanceof Object && 'node' in chain.input.number) {
			console.log('is number', chain.input.number.input.number1)
		} else {
			chain.input.number
		}
		break
	case 'sendEmail':
		console.log(chain.input.message)
}
