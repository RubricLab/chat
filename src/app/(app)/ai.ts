'use server'

import env from '~/env'

import { z } from 'zod/v4'
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

	const thing: typeof chain = {
		node: 'addNumbers',
		input: {
			number1: 1,
			number2: {
				node: 'addNumbers',
				input: {
					number1: {
						node: 'addNumbers',
						input: {
							number1: {
								node: 'addNumbers',
								input: {
									number1: 2,
									number2: 3
								}
							},
							number2: {
								node: 'addNumbers',
								input: {
									number1: 4,
									number2: 5
								}
							}
						}
					},
					number2: 3
				}
			}
		}
	}

	console.dir({ chain }, { depth: null })
}
