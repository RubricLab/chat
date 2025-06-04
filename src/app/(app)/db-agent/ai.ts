'use server'

import { executeDbAgent } from '~/db-agent/agent'
import { publish } from '~/db-agent/events/server'
import env from '~/env'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { answer } = await executeDbAgent({
		messages: [{ role: 'user', content: message }],
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
