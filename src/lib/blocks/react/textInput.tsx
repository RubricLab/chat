'use client'

import { useState } from 'react'

export function TextInput() {
	const [value, setValue] = useState('')
	return {
		react: <input onChange={e => setValue(e.target.value)} type="text" />,
		state: value
	}
}
