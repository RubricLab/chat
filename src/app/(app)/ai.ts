'use server'

import env from '~/env'

import { executeUIAgent } from '~/agents/ui'
import { publish } from '~/events/server'

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { chain } = await executeUIAgent({
		messages: [{ role: 'user', content: message }],
		onEvent: async events => {
			switch (events.type) {
				// case 'function_call':
				// 	await publish({
				// 		channel: userId,
				// 		eventType: events.name,
				// 		payload: events
				// 	})
				// 	break
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

	console.dir({ chain }, { depth: null })
}
