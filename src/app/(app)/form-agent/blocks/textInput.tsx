'use client'

import { useEffect, useState } from 'react'

export function TextInput({ emit }: { emit: (value: string) => void }) {
	const [value, setValue] = useState('')

	useEffect(() => {
		emit(value)
	}, [value, emit])

	return <input onChange={e => setValue(e.target.value)} type="text" />
}
