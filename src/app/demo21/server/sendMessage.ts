'use server'

import { publish } from '../events.server'

export async function sendMessage({ message }: { message: string }) {
	publish({
		channel: 'main',
		eventType: 'block',
		payload: {
			block: 'heading',
			props: {
				text: 'hello world'
			}
		}
	})
}
