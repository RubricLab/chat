'use client'

import { Button, Container, Textarea } from '@rubriclab/ui'
import { type KeyboardEvent, useState } from 'react'

export function ChatBox({
	submit,
	placeholder = 'Type a message...'
}: {
	submit: (message: string) => void
	placeholder?: string
}) {
	const [message, setMessage] = useState(placeholder)

	function handleSubmit() {
		if (!message.trim()) return

		submit(message)
		setMessage('')
	}

	return (
		<Container align="center" className="fixed bottom-0 left-0" justify="center" height="fit">
			<Container
				className="max-w-3xl"
				padding="md"
				justify="center"
				arrangement="row"
				gap="sm"
				align="center"
			>
				<Textarea
					value={message}
					onChange={e => {
						setMessage(e.target.value)
						e.target.style.height = 'auto'
						e.target.style.height = `${e.target.scrollHeight}px`
					}}
					onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							if (message.trim()) {
								submit(message)
								setMessage('')
							}
						}
					}}
					rows={1}
				/>
				<Button type="button" variant="primary" onClick={handleSubmit} icon="arrowRight" label="Send" />
			</Container>
		</Container>
	)
}
