'use client'

import { useState } from 'react'
import type { z } from 'zod/v4'
import type { contact } from '~/actions'

export function ContactSelect({ contacts }: { contacts: z.infer<typeof contact>[] }) {
	const initialValue = contacts[0]
	if (!initialValue) {
		throw new Error('No contacts provided')
	}

	const [value, setValue] = useState<z.infer<typeof contact>>(initialValue)
	return {
		react: (
			<select
				onChange={e => {
					const contact = contacts.find(c => c.email === e.target.value)
					if (contact) {
						setValue(contact)
					}
				}}
			>
				{contacts.map(contact => (
					<option key={contact.email} value={contact.email}>
						{contact.name}
					</option>
				))}
			</select>
		),
		state: value
	}
}
