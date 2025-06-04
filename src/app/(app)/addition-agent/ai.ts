'use server'

import { executeAdditionAgent } from '~/addition-agent/agent'
import env from '~/env'

export async function sendMessage({ message }: { message: string }) {
	const { answer } = await executeAdditionAgent({
		messages: [{ role: 'user', content: message }],
		openAIKey: env.OPENAI_API_KEY,
		onEvent: async events => {
			console.log(events)
		}
	})
	return answer
}
