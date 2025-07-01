'use server'

import env from '~/env'
import { executeWebsiteAgent } from '~/website-agent/agent'
import { publish } from '~/website-agent/events/server'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { chain } = await executeWebsiteAgent({
		messages: [{ content: message, role: 'user' }],
		onEvent: async events => {
			switch (events.type) {
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

	console.log(chain)
}
