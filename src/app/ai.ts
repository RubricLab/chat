'use server'

import { executeAgent } from '~/agents'
import { publish } from '~/events'

export async function sendMessage(message: string) {
	await executeAgent(
		[
			{
				role: 'user',
				content: message
			}
		],
		{
			on: {
				chatMessage: async ({ event }) => {
					publish('chatMessage', {
						event
					})
				}
			}
		}
	)
}
