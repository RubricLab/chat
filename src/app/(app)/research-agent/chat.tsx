'use client'

import { type ChangeEvent, useState } from 'react'
import { useSession } from '~/auth/client'
import type { ResearchAgentResponseEvent, ResearchAgentToolEvent } from '~/research-agent/agent'
import { sendMessage } from '~/research-agent/ai'
import { useEvents } from '~/research-agent/events/client'

type Message =
	| ResearchAgentToolEvent
	| ResearchAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState('What is the price of Bitcoin?')

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
			return (
				<div>
					Assistant: {message.message.answer}
					{message.message.sources.map(source => (
						<div key={source.url}>
							<a href={source.url}>{source.title}</a>
						</div>
					))}
				</div>
			)
		}

		case 'function_call': {
			switch (message.name) {
				case 'research': {
					const {
						arguments: { query },
						result
					} = message
					return (
						<div>
							<p>Researching {query}...</p>
							<p>Found {result.length} results</p>
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
			research: d =>
				console.log(
					d.arguments.query,
					d.result.map(r => r.title)
				),
			assistant_message: ({ message }) => console.log(message.answer)
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
