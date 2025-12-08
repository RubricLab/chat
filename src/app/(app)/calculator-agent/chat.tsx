'use client'

import { Code, Text } from '@rubriclab/ui'
import { useEffect, useState } from 'react'
import { useSession } from '~/auth/client'
import type {
	CalculatorAgentResponseEvent,
	CalculatorAgentToolEvent
} from '~/calculator-agent/agent'
import { sendMessage } from '~/calculator-agent/ai'
import { useEvents } from '~/calculator-agent/events/client'
import { AssistantMessage, UserMessage } from '~/components/message'
import { ChatBox } from '../../../lib/components/chatBox'
import type { Chain } from './chains'
import { executeChain } from './chains/execute'

type Message =
	| CalculatorAgentToolEvent
	| CalculatorAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function RenderChain({ chain }: { chain: Chain }) {
	const [result, setResult] = useState<Awaited<ReturnType<typeof executeChain>> | null>(null)
	useEffect(() => {
		executeChain(chain).then(setResult)
	}, [chain])

	return result && <Text>Result: {result}</Text>
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
					<RenderChain chain={message.message.chain} />
				</AssistantMessage>
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
			<ChatBox
				placeholder="Add 3 and 4, convert to string, then back to a number. Multiply that by 7."
				submit={handleSubmit}
			/>
		</div>
	)
}
