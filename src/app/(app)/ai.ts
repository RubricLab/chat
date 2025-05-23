'use server'

import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createTool } from '@rubriclab/agents/lib/tool'
import { z } from 'zod/v4'
import env from '~/env'
import { publish } from '~/events/server'

const weatherToolRegistry = z.registry<{ id: string }>()
const responseFormatRegistry = z.registry<{ id: string }>()

const location = z
	.enum(['new york', 'los angeles', 'chicago', 'houston', 'miami'])
	.register(weatherToolRegistry, { id: 'location' })
	.register(responseFormatRegistry, { id: 'location' })

const getWeather = createTool({
	schema: {
		input: { location },
		output: z.string()
	},
	execute: async ({ location }) => `The weather in ${location} is sunny`,
	registry: weatherToolRegistry
})

// console.dir(getWeather.definition, { depth: null })

const weather = z
	.enum(['sunny', 'cloudy', 'rainy'])
	.register(responseFormatRegistry, { id: 'weather' })

const forecast = z
	.object({
		message: z.string(),
		location,
		weather
	})
	.register(responseFormatRegistry, { id: 'forecast' })

const responseFormat = createResponseFormat({
	name: 'answer',
	schema: z.object({ forecast }),
	registry: responseFormatRegistry
})

// console.dir(responseFormat, { depth: null })

const { executeAgent } = createAgent({
	openAIKey: env.OPENAI_API_KEY,
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: { getWeather },
	responseFormat
})

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { forecast } = await executeAgent([{ role: 'user', content: message }])

	await publish({
		channel: userId,
		eventType: 'message',
		payload: { role: 'assistant', content: forecast.message }
	})
}
