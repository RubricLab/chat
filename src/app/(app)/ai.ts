'use server'

import { createAgent } from '@rubriclab/agents/lib/agent2'
import env from '~/env'
import { publish } from '~/events/server'

const { executeAgent } = createAgent({
	openAIKey: env.OPENAI_API_KEY,
	systemPrompt: 'You are a helpful agent that says "hi!"'
})

export async function sendMessage({ userId, message }: { userId: string; message: string }) {
	const { answer } = await executeAgent([{ role: 'user', content: message }])

	await publish({
		channel: userId,
		eventType: 'message',
		payload: { role: 'assistant', content: answer }
	})
}
