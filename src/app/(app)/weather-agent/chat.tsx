'use client'

import { useState } from 'react'
import { useSession } from '~/auth/client'
import { AssistantMessage, ToolMessage, UserMessage } from '~/components/message'
import type { WeatherAgentResponseEvent, WeatherAgentToolEvent } from '~/weather-agent/agent'
import { sendMessage } from '~/weather-agent/ai'
import { useEvents } from '~/weather-agent/events/client'
import { ChatBox } from '../../../lib/components/chatBox'

type Message =
	| WeatherAgentToolEvent
	| WeatherAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function MessageSwitch({ message }: { message: Message }) {
	switch (message.type) {
		case 'user_message': {
			return <UserMessage>{message.message}</UserMessage>
		}

		case 'assistant_message': {
			return <AssistantMessage>{message.message.answer}</AssistantMessage>
		}

		case 'function_call': {
			switch (message.name) {
				case 'getWeather': {
					const {
						arguments: { city },
						result: { temp, condition }
					} = message
					return (
						<ToolMessage
							name="getWeather"
							args={
								<>
									Getting weather for: <strong>{city}</strong>
								</>
							}
							result={
								<>
									It is <strong>{temp}°F</strong> and <strong>{condition}</strong>
								</>
							}
						/>
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
			assistant_message: addMessage,
			getWeather: addMessage
		}
	})

	return (
		<div className="pb-16">
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

	function handleSubmit(message: string) {
		addMessage({
			id: Date.now().toString(),
			message,
			type: 'user_message'
		})
		sendMessage({ message, userId })
	}

	return (
		<div className="w-full">
			<ChatMessages userId={userId} messages={messages} addMessage={addMessage} />
			<ChatBox placeholder="What is the weather in NYC?" submit={handleSubmit} />
		</div>
	)
}
