'use server'

import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import env from '~/env'
import { publish } from '~/events/server'

const getWeather = {
	schema: {
		input: z.object({ location: z.string() }),
		output: z.string()
	},
	execute: z
		.function({
			input: [z.object({ location: z.string() })],
			output: z.string()
		})
		.implementAsync(async ({ location }) => {
			return `The weather in ${location} is sunny`
		})
}

const { executeAgent } = createAgent({
	openAIKey: env.OPENAI_API_KEY,
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: { getWeather },
	responseFormat: createResponseFormat({
		name: 'answer',
		schema: z.object({ weather: z.string() })
	})
})

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { weather } = await executeAgent([{ role: 'user', content: message }])

	await publish({
		channel: userId,
		eventType: 'message',
		payload: { role: 'assistant', content: weather }
	})
}
