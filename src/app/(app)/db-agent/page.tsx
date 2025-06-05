'use client'

import { Chat } from '~/db-agent/chat'

export default function () {
	return (
		<>
			<h1 className="mb-4 font-bold text-2xl">DB Agent</h1>
			<Chat />
		</>
	)
}
