'use server'

import env from '~/env'
import { executeFormAgent } from '~/form-agent/agent'
import { publish } from '~/form-agent/events/server'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { chain } = await executeFormAgent({
		messages: [{ content: message, role: 'user' }],
		onEvent: async events => {
			switch (events.type) {
				case 'function_call': {
					switch (events.name) {
						case 'instantiateForm': {
							await publish({
								channel: userId,
								eventType: events.name,
								payload: events
							})
							break
						}
					}
					break
				}
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
