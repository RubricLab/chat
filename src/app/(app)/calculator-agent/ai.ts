'use server'

import { executeCalculatorAgent } from '~/calculator-agent/agent'
import { publish } from '~/calculator-agent/events/server'
import env from '~/env'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { chain } = await executeCalculatorAgent({
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
