'use client'

import { useEffect, useState } from 'react'
import { useSession } from '~/auth/client'
import { ChatBox } from '~/components/chatBox'
import { Code } from '~/components/code'
import { Dropdown } from '~/components/dropdown'
import { AssistantMessage, UserMessage } from '~/components/message'
import type { TableAgentResponseEvent, TableAgentToolEvent } from '~/table-agent/agent'
import { sendMessage } from '~/table-agent/ai'
import { executeChain } from '~/table-agent/chains/execute'
import { useEvents } from '~/table-agent/events/client'

type Message =
	| TableAgentToolEvent
	| TableAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function RenderChain({ chain }: { chain: TableAgentResponseEvent['message']['chain'] }) {
	const [result, setResult] = useState<Awaited<ReturnType<typeof executeChain>> | null>(null)
	useEffect(() => {
		executeChain(chain).then(setResult)
	}, [chain])

	return result
}

function MessageSwitch({ message }: { message: Message }) {
	switch (message.type) {
		case 'user_message': {
			return <UserMessage>{message.message}</UserMessage>
		}

		case 'assistant_message': {
			return (
				<>
					<AssistantMessage>
						<Dropdown title="View Chain">
							<Code json={JSON.parse(JSON.stringify(message.message.chain))} />
						</Dropdown>
					</AssistantMessage>
					<AssistantMessage>
						<RenderChain chain={message.message.chain} />
					</AssistantMessage>
				</>
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
			message,
			type: 'user_message'
		})
		sendMessage({ message, userId })
	}

	return (
		<div className="w-full">
			<ChatMessages userId={userId} messages={messages} addMessage={addMessage} />
			<ChatBox placeholder="Generate a table of users" submit={handleSubmit} />
		</div>
	)
}
