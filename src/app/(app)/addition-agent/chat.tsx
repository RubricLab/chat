'use client'

import { type ChangeEvent, useState } from 'react'
import type { AdditionAgentResponseEvent } from '~/addition-agent/agent'
import { sendMessage } from '~/addition-agent/ai'

type Message =
	| AdditionAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function ChatBox({ addMessage }: { addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState('What is 1 + 1?')

	function handleInput({ target: { value } }: ChangeEvent<HTMLInputElement>) {
		setMessage(value)
	}

	function handleSubmit() {
		addMessage({
			id: Date.now().toString(),
			type: 'user_message',
			message
		})
		sendMessage({ message })
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
	}
}

function ChatMessages({ messages }: { messages: Message[] }) {
	return (
		<div>
			{messages.map(message => (
				<MessageSwitch key={message.id} message={message} />
			))}
		</div>
	)
}

export function Chat() {
	const [messages, setMessages] = useState<Message[]>([])

	function addMessage(message: Message) {
		setMessages(prev => [...prev, message])
	}

	return (
		<>
			<ChatBox addMessage={addMessage} />
			<ChatMessages messages={messages} />
		</>
	)
}
