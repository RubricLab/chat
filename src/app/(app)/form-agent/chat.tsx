'use client'

import { useState } from 'react'
import { useSession } from '~/auth/client'
import { Code } from '~/components/code'
import { AssistantMessage, ToolMessage, UserMessage } from '~/components/message'
import { sendMessage } from '~/form-agent/ai'
import { useEvents } from '~/form-agent/events/client'
import { ChatBox } from '../../../lib/components/chatBox'
import type { FormAgentResponseEvent, FormAgentToolEvent } from './agent'

type Message =
	| FormAgentToolEvent
	| FormAgentResponseEvent
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
			return (
				<AssistantMessage>
					<Code json={JSON.parse(JSON.stringify(message.message.chain))} />
					{/* Rendering not yet implemented */}
				</AssistantMessage>
			)
		}

		case 'function_call': {
			switch (message.name) {
				case 'instantiateForm': {
					return (
						<ToolMessage
							name="instantiateForm"
							args={<>Instantiating form for the {message.arguments.actionName} action...</>}
							result={<>Form instantiated</>}
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
			instantiateForm: addMessage
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
			<ChatBox placeholder="Create a form to send an email" submit={handleSubmit} />
		</div>
	)
}
