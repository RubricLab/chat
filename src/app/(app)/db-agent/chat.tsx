'use client'

import { type ChangeEvent, useState } from 'react'
import { useSession } from '~/auth/client'
import type { DbAgentResponseEvent, DbAgentToolEvent } from '~/db-agent/agent'
import { sendMessage } from '~/db-agent/ai'
import { useEvents } from '~/db-agent/events/client'

type Message =
	| DbAgentToolEvent
	| DbAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState('How many users are there?')

	function handleInput({ target: { value } }: ChangeEvent<HTMLInputElement>) {
		setMessage(value)
	}

	function handleSubmit() {
		addMessage({
			id: Date.now().toString(),
			type: 'user_message',
			message
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
function MessageSwitch({ message }: { message: Message }) {
	switch (message.type) {
		case 'user_message': {
			return <div>User: {message.message}</div>
		}

		case 'assistant_message': {
			return <div>Assistant: {message.message.answer}</div>
		}

		case 'function_call': {
			switch (message.name) {
				case 'getUsers': {
					const { result } = message
					return (
						<div>
							<p>Fetching users from db...</p>
							<p>Found {result.length} users</p>
						</div>
					)
				}
			}
		}
	}
}

function ChatMessages({
	userId,
	messages,
	addMessage
}: {
	userId: string
	messages: Message[]
	addMessage: (message: Message) => void
}) {
	useEvents({
		id: userId,
		on: {
			getUsers: addMessage,
			assistant_message: addMessage
		}
	})

	return (
		<div>
			{messages.map(message => (
				<MessageSwitch key={message.id} message={message} />
			))}
		</div>
	)
}

export function Chat() {
	const { userId } = useSession()
	const [messages, setMessages] = useState<Message[]>([])

	function addMessage(message: Message) {
		setMessages(prev => [...prev, message])
	}

	return (
		<>
			<ChatBox userId={userId} addMessage={addMessage} />
			<ChatMessages userId={userId} messages={messages} addMessage={addMessage} />
		</>
	)
}
