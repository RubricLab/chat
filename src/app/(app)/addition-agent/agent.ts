import { createAgent, createTool } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'

export const { executeAgent: executeAdditionAgent, __ResponseEvent } = createAgent({
	systemPrompt: 'You are an addition agent. Use tools to add two numbers.',
	tools: {
		add: createTool({
			schema: {
				input: { a: z.number(), b: z.number() },
				output: z.number()
			},
			execute: async ({ a, b }) => a + b
		})
	},
	responseFormat: createResponseFormat({
		name: 'addition_result',
		schema: z.object({
			answer: z.number()
		})
	})
})

export type AdditionAgentResponseEvent = typeof __ResponseEvent
