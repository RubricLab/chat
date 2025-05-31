'use client'

import { type ChangeEvent, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { sendMessage } from '~/(app)/ai'
import { actions } from '~/actions'
import { execute } from '~/actions/server'
import type { UIEventTypes } from '~/agents/ui'
import { drill } from '~/agents/ui'
import { useSession } from '~/auth/client'
import { blocks } from '~/blocks'
import { render } from '~/blocks/client'
import { useEvents } from '~/events/client'

type Message =
	| UIEventTypes
	| {
			id: string
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

function RenderChain({ chain }: { chain: UIEventTypes['message']['chain'] }) {
	const [UI, setUi] = useState<ReactNode | null>(null)
	useEffect(() => {
		;(async function fetchUi() {
			const output = await drill(chain, key => {
				if (key in blocks) {
					return async input =>
						await render({ block: key as keyof typeof blocks, props: input, emit() {} })
				}
				if (key in actions) {
					return async input => await execute({ action: key as keyof typeof actions, params: input })
				}
				throw 'up'
			})
			setUi(output)
		})()
	}, [chain])

	if (!UI) return null

	return <div>{UI}</div>
}

function MessageSwitch({ message }: { message: Message }) {
	switch (message.type) {
		case 'user_message': {
			return <div>{message.message}</div>
		}

		case 'assistant_message': {
			return <RenderChain chain={message.message.chain} />
		}

		// case 'function_call': {
		// 	return (
		// 		<div>
		// 			called {message.name} with {JSON.stringify(message.arguments)} and got{' '}
		// 			{JSON.stringify(message.result)}
		// 		</div>
		// 	)
		// }
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
			// heading: msg => {
			// 	addMessage(msg)
			// },
			assistant_message: msg => {
				addMessage(msg)
			}
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
