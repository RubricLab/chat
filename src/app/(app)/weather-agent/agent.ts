import { createAgent, createTool } from '@rubriclab/agents'
import { z } from 'zod/v4'

const systemPrompt = 'You are a weather agent. Use tools to get the weather for the user.'

const weatherTool = createTool({
	execute: async ({ city: _city }) => ({ condition: 'sunny', temp: 72 }),
	schema: {
		input: { city: z.string() },
		output: z.object({ condition: z.string(), temp: z.number() })
	}
})

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	systemPrompt,
	tools: { getWeather: weatherTool }
})

export { eventTypes as weatherAgentEventTypes }
export { executeAgent as executeWeatherAgent }

export type WeatherAgentToolEvent = typeof __ToolEvent
export type WeatherAgentResponseEvent = typeof __ResponseEvent
