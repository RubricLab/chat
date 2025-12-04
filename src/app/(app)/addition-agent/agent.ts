import { createAgent, createTool } from '@rubriclab/agents'
import { z } from 'zod'

export const { executeAgent: executeAdditionAgent, __ResponseEvent } = createAgent({
	model: 'gpt-5.1',
	systemPrompt: 'You are an addition agent. Use tools to add two numbers.',
	tools: {
		add: createTool({
			execute: async ({ a, b }) => a + b,
			schema: {
				input: z.object({ a: z.number(), b: z.number() }),
				output: z.number()
			}
		})
	}
})

export type AdditionAgentResponseEvent = typeof __ResponseEvent
