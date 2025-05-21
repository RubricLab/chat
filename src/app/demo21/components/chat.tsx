'use client'

import { useState } from 'react'

import { sendMessage } from '../server/sendMessage'

export function Chat() {
	const [input, setInput] = useState('')

	async function onSubmit() {
		await sendMessage({ message: input })
	}

	return (
		<div>
			<h1>Chat</h1>
			<input onChange={({ target }) => setInput(target.value)} value={input} />
			<button type="button" onClick={onSubmit}>
				Send
			</button>
		</div>
	)
}
