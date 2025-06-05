'use client'

import { type KeyboardEvent, useState } from 'react'

export function ChatBox({
	submit,
	placeholder = 'Type a message...'
}: {
	submit: (message: string) => void
	placeholder?: string
}) {
	const [message, setMessage] = useState(placeholder)

	const handleSubmit = () => {
		submit(message)
		setMessage('')
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSubmit()
		}
	}

	return (
		<div className="fixed right-0 bottom-0 left-0 bg-white p-4 dark:bg-black">
			<div className="flex gap-2">
				<input
					type="text"
					value={message}
					onChange={e => setMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
				/>
				<button
					type="button"
					onClick={handleSubmit}
					className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Send Message
				</button>
			</div>
		</div>
	)
}
