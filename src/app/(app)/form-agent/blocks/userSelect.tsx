'use client'

import { useEffect, useState } from 'react'
import type { z } from 'zod/v4'
import type { user } from '~/form-agent/actions'

export function UserSelect({
	users,
	emit
}: { users: z.infer<typeof user>[]; emit: (value: z.infer<typeof user>) => void }) {
	const initialValue = users[0]
	if (!initialValue) {
		throw new Error('No contacts provided')
	}

	const [value, setValue] = useState<z.infer<typeof user>>(initialValue)
	useEffect(() => {
		emit(value)
	}, [value, emit])

	return (
		<select
			onChange={e => {
				const user = users.find(u => u.email === e.target.value)
				if (user) {
					setValue(user)
				}
			}}
		>
			{users.map(user => (
				<option key={user.email} value={user.email}>
					{user.email}
				</option>
			))}
		</select>
	)
}
