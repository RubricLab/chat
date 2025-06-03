'use client'

import { useState } from 'react'

export function NumberInput() {
	const [value, setValue] = useState(0)
	return {
		react: <input onChange={e => setValue(Number(e.target.value))} type="number" />,
		state: value
	}
}
