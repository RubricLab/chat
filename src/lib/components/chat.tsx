'use client'

import { useSession } from '@rubriclab/auth/lib/client'
import { type ChangeEvent, useState } from 'react'
import { sendMessage } from '~/(app)/ai'
import type { WeatherEventTypes } from '~/agents/weather'
import { useEvents } from '~/events/client'

type Message =
	| WeatherEventTypes
	| {
			type: 'user_message'
			message: string
	  }

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState('')

	function handleInput({ target: { value } }: ChangeEvent<HTMLInputElement>) {
		setMessage(value)
	}

	function handleSubmit() {
		addMessage({
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

function Message({ message }: { message: Message }) {
	switch (message.type) {
		case 'user_message': {
			return <div>{message.message}</div>
		}

		case 'assistant_message': {
			return <div>{message.message.forecast.message}</div>
		}

		case 'function_call': {
			return (
				<div>
					called {message.name} with {JSON.stringify(message.arguments)} and got{' '}
					{JSON.stringify(message.result)}
				</div>
			)
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
			getWeather: msg => {
				addMessage(msg)
			},
			assistant_message: msg => {
				addMessage(msg)
			}
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
	const [messages, setMessages] = useState<Message[]>([])

	function addMessage(message: Message) {
		setMessages(prev => [...prev, message])
	}

	return (
		<>
			{ChatBox({ userId, addMessage })}
			{ChatMessages({ userId, messages, addMessage })}
		</>
	)
}
