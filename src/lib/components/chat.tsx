'use client'

import { useSession } from '@rubriclab/auth/lib/client'
import type { ResponseInputItem } from 'openai/resources/responses/responses'
import { type ChangeEvent, useState } from 'react'
import { sendMessage } from '~/(app)/ai'
import { useEvents } from '~/events/client'

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: ResponseInputItem) => void }) {
	const [message, setMessage] = useState('')

	function handleInput({ target: { value } }: ChangeEvent<HTMLInputElement>) {
		setMessage(value)
	}

	function handleSubmit() {
		addMessage({
			role: 'user',
			content: message
		})
		sendMessage({ userId, message })
		setMessage('')
	}

	return (
		<div>
			<input type="text" value={message} onChange={handleInput} />
			<button type="button" onClick={handleSubmit}>
				Send Message
			</button>
		</div>
	)
}

function Message({ message }: { message: ResponseInputItem }) {
	switch (message.type) {
		case 'message': {
			if (Array.isArray(message.content)) {
				return (
					<div>
						{message.content.map(part => {
							switch (part.type) {
								case 'input_text':
									return <div>{part.text}</div>
								case 'output_text':
									return <div>{part.text}</div>
								case 'input_file':
									return <div>{part.filename}</div>
								case 'input_image':
									return <img src={part.image_url ?? undefined} alt={part.file_id ?? undefined} />
								case 'refusal':
									return <div>{part.refusal}</div>
							}
						})}
					</div>
				)
			}

			return <div>{message.content}</div>
		}

		default: {
			return <div>{JSON.stringify(message)}</div>
		}
	}
}

function ChatMessages({
	userId,
	messages,
	addMessage
}: {
	userId: string
	messages: ResponseInputItem[]
	addMessage: (message: ResponseInputItem) => void
}) {
	useEvents({
		id: userId,
		on: {
			message: addMessage
		}
	})

	return (
		<div>
			{messages.map((message, index) => (
				<Message key={`message-${index}`} message={message} />
			))}
		</div>
	)
}

export function Chat() {
	const { userId } = useSession()
	const [messages, setMessages] = useState<ResponseInputItem[]>([])

	function addMessage(message: ResponseInputItem) {
		setMessages(prev => [...prev, message])
	}

	return (
		<>
			<ChatBox userId={userId} addMessage={addMessage} />
			<ChatMessages userId={userId} messages={messages} addMessage={addMessage} />
		</>
	)
}
