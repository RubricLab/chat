import { createAgent, createTool, noTabs } from '@rubriclab/agents'
import { z } from 'zod'

const systemPrompt = noTabs`
	You are a weather agent.
	Use tools to get the weather for the user.
`

const weatherTool = createTool({
	execute: async ({ city: _city }) => ({ condition: 'sunny', temp: 72 }),
	schema: {
		input: z.object({ city: z.string() }),
		output: z.object({ condition: z.string(), temp: z.number() })
	}
})

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	model: 'gpt-5.1',
	systemPrompt,
	tools: { getWeather: weatherTool }
})

export { eventTypes as weatherAgentEventTypes }
export { executeAgent as executeWeatherAgent }

export type WeatherAgentToolEvent = typeof __ToolEvent
export type WeatherAgentResponseEvent = typeof __ResponseEvent
