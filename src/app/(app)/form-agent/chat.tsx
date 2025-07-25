'use client'

import { useState } from 'react'
import { useSession } from '~/auth/client'
import { ChatBox } from '~/components/chatBox'
import { Code } from '~/components/code'
import { Dropdown } from '~/components/dropdown'
import { AssistantMessage, ToolMessage, UserMessage } from '~/components/message'
import { sendMessage } from '~/form-agent/ai'
import { useEvents } from '~/form-agent/events/client'
import type { FormAgentResponseEvent, FormAgentToolEvent } from './agent'
import { addBlock } from './blocks'
import { form } from './blocks/form'
import { select } from './blocks/select'
import { RenderChain } from './chains/execute'

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
					<Dropdown title="View Chain">
						<Code json={JSON.parse(JSON.stringify(message.message.chain))} />
					</Dropdown>
					<RenderChain chain={message.message.chain} />
				</AssistantMessage>
			)
		}

		case 'function_call': {
			switch (message.name) {
				case 'instantiateForm': {
					addBlock({
						block: form.instantiate(message.arguments),
						name: `form<${message.arguments}>`
					})
					return (
						<ToolMessage
							name="instantiateForm"
							args={<>Instantiating form for the {message.arguments} action...</>}
							// result={<>Form instantiated</>}
						/>
					)
				}
				case 'instantiateSelect': {
					addBlock({
						block: select.instantiate(message.arguments),
						name: `select<${message.arguments}>`
					})
					return (
						<ToolMessage
							name="instantiateSelect"
							args={<>Instantiating select for the {message.arguments} action...</>}
							// result={<>Select instantiated</>}
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
			instantiateForm: addMessage,
			instantiateSelect: addMessage
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
				placeholder="Create a form to send an email - put a dropdown of contacts in the recipient field"
				submit={handleSubmit}
			/>
		</div>
	)
}
