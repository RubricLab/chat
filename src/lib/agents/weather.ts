import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createTool } from '@rubriclab/agents/lib/tool'
import { z } from 'zod/v4'

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

export const {
	executeAgent: executeWeatherAgent,
	eventTypes: weatherAgentEventTypes,
	__Event
} = createAgent({
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: { getWeather },
	responseFormat
})

export type WeatherEventTypes = typeof __Event
