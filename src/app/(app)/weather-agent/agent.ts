import { createAgent, createTool } from '@rubriclab/agents'
import { z } from 'zod/v4'

const systemPrompt = 'You are a weather agent. Use tools to get the weather for the user.'

const weatherTool = createTool({
	schema: {
		input: { city: z.string() },
		output: z.object({ temp: z.number(), condition: z.string() })
	},
	execute: async ({ city }) => ({ temp: 72, condition: 'sunny' })
})

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	systemPrompt,
	tools: { getWeather: weatherTool }
})

export { eventTypes as weatherAgentEventTypes }
export { executeAgent as executeWeatherAgent }

export type WeatherAgentToolEvent = typeof __ToolEvent
export type WeatherAgentResponseEvent = typeof __ResponseEvent
