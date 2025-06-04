'use client'

import { type ChangeEvent, useState } from 'react'
import { useSession } from '~/auth/client'
import type { WeatherAgentResponseEvent, WeatherAgentToolEvent } from '~/weather-agent/agent'
import { sendMessage } from '~/weather-agent/ai'
import { useEvents } from '~/weather-agent/events/client'

type Message =
	| WeatherAgentToolEvent
	| WeatherAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState('What is the weather in NYC?')

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
				case 'getWeather': {
					const {
						arguments: { city },
						result: { temp, condition }
					} = message
					return (
						<div>
							<p>Getting weather for {city}...</p>
							<p>
								It is {temp}°F and {condition}
							</p>
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
			getWeather: addMessage,
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
