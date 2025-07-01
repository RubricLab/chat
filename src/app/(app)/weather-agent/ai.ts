'use server'

import env from '~/env'
import { executeWeatherAgent } from '~/weather-agent/agent'
import { publish } from '~/weather-agent/events/server'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { answer } = await executeWeatherAgent({
		messages: [{ content: message, role: 'user' }],
		onEvent: async events => {
			switch (events.type) {
				case 'function_call':
					await publish({
						channel: userId,
						eventType: events.name,
						payload: events
					})
					break
				case 'assistant_message':
					await publish({
						channel: userId,
						eventType: events.type,
						payload: events
					})
					break
			}
		},
		openAIKey: env.OPENAI_API_KEY
	})

	console.log(answer)
}
