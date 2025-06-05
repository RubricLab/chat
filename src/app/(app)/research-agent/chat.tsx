'use client'

import { useState } from 'react'
import { useSession } from '~/auth/client'
import { AssistantMessage, ToolMessage, UserMessage } from '~/components/message'
import type { ResearchAgentResponseEvent, ResearchAgentToolEvent } from '~/research-agent/agent'
import { sendMessage } from '~/research-agent/ai'
import { useEvents } from '~/research-agent/events/client'
import { ChatBox } from '../../../lib/components/chatBox'

type Message =
	| ResearchAgentToolEvent
	| ResearchAgentResponseEvent
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
					<div>
						{message.message.answer}
						{message.message.sources.length > 0 && (
							<div className="mt-3 border-gray-300 border-t pt-3">
								<div className="mb-2 font-medium text-gray-600 text-sm">Sources:</div>
								{message.message.sources.map(source => (
									<div key={source.url} className="mb-1">
										<a
											href={source.url}
											className="text-blue-600 text-sm underline hover:text-blue-800"
											target="_blank"
											rel="noopener noreferrer"
										>
											{source.title}
										</a>
									</div>
								))}
							</div>
						)}
					</div>
				</AssistantMessage>
			)
		}

		case 'function_call': {
			switch (message.name) {
				case 'search': {
					const {
						arguments: { query },
						result
					} = message
					return (
						<ToolMessage
							name="research"
							args={
								<>
									Searching for: <strong>{query}</strong>
								</>
							}
							result={
								<>
									Found <strong>{result.length}</strong> results
								</>
							}
						/>
					)
				}

				case 'getContents': {
					const {
						arguments: { url },
						result
					} = message
					return (
						<ToolMessage
							name="research"
							args={
								<>
									Retrieving contents of <strong>{url}</strong>
								</>
							}
							result={
								<>
									Reading{' '}
									<strong>
										<a href={result.url} target="_blank" rel="noopener noreferrer">
											{result.title}
										</a>
									</strong>
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
			search: addMessage,
			getContents: addMessage,
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
			<ChatBox placeholder="Tell me about Rubric Labs" submit={handleSubmit} />
		</div>
	)
}
