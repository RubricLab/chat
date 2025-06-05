'use client'

import { useState } from 'react'
import type { AdditionAgentResponseEvent } from '~/addition-agent/agent'
import { sendMessage } from '~/addition-agent/ai'
import { ChatBox } from '~/components/chatBox'
import { AssistantMessage, UserMessage } from '~/components/message'

type Message =
	| AdditionAgentResponseEvent
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
	}
}

function ChatMessages({ messages }: { messages: Message[] }) {
	return (
		<div className="pb-16">
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

	async function handleSubmit(message: string) {
		addMessage({
			id: Date.now().toString(),
			type: 'user_message',
			message
		})
		const answer = await sendMessage({ message })
		addMessage({
			id: Date.now().toString(),
			type: 'assistant_message',
			message: { answer }
		})
	}

	return (
		<div className="w-full">
			<ChatMessages messages={messages} />
			<ChatBox placeholder="What is 1 + 1?" submit={handleSubmit} />
		</div>
	)
}
