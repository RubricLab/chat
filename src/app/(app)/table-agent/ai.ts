'use server'

import env from '~/env'
import { executeTableAgent } from '~/table-agent/agent'
import { publish } from '~/table-agent/events/server'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { chain } = await executeTableAgent({
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
