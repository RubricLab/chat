'use client'

import { useState } from 'react'
import { useSession } from '~/auth/client'
import { ChatBox } from '~/components/chatBox'
import { AssistantMessage, ToolMessage, UserMessage } from '~/components/message'
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
				case 'getUsers': {
					const { result } = message
					return (
						<ToolMessage
							name="getUsers"
							args={<>Fetching users from database...</>}
							result={
								<>
									Found <strong>{result.length}</strong> users
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
			ping: payload => {
				console.log('ping', payload)
			},
			getUsers: addMessage,
			assistant_message: addMessage
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
			type: 'user_message',
			message
		})
		sendMessage({ userId, message })
	}

	return (
		<div className="w-full">
			<ChatMessages userId={userId} messages={messages} addMessage={addMessage} />
			<ChatBox placeholder="How many users are there?" submit={handleSubmit} />
		</div>
	)
}
