'use server'

import { executeAdditionAgent } from '~/addition-agent/agent'
import env from '~/env'

export async function sendMessage({ message }: { message: string }) {
	const { answer } = await executeAdditionAgent({
		messages: [{ content: message, role: 'user' }],
		onEvent: async _events => {
			// console.log(events)
		},
		openAIKey: env.OPENAI_API_KEY
	})
	return answer
}
