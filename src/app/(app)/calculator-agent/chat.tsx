'use client'

import { type ChangeEvent, useEffect, useState } from 'react'
import { useSession } from '~/auth/client'
import type {
	CalculatorAgentResponseEvent,
	CalculatorAgentToolEvent
} from '~/calculator-agent/agent'
import { sendMessage } from '~/calculator-agent/ai'
import { useEvents } from '~/calculator-agent/events/client'
import { Code } from '~/components/code'
import { executeChain } from './chains/execute'

type Message =
	| CalculatorAgentToolEvent
	| CalculatorAgentResponseEvent
	| {
			id: string
			type: 'user_message'
			message: string
	  }

function RenderChain({ chain }: { chain: CalculatorAgentResponseEvent['message']['chain'] }) {
	const [result, setResult] = useState<Awaited<ReturnType<typeof executeChain>> | null>(null)
	useEffect(() => {
		executeChain(chain).then(setResult)
	}, [chain])

	return result && <div>Result: {result}</div>
}

function ChatBox({
	userId,
	addMessage
}: { userId: string; addMessage: (message: Message) => void }) {
	const [message, setMessage] = useState(
		'Add 3 and 4, convert to string, then back to a number. Multiply that by 7.'
	)

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
					Assistant: <Code json={JSON.parse(JSON.stringify(message.message.chain))} />
					<RenderChain chain={message.message.chain} />
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
