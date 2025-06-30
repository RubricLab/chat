'use client'

import { z } from 'zod/v4'
import { useStateful } from './state'

export function TextInput() {
	const { state, element } = useStateful(z.string(), 'hello', TextInputComponent)

	return { state, react: element }
}

export function TextInputComponent({
	state,
	setState
}: {
	state: string
	setState: (state: string) => void
}) {
	return <input type="text" value={state} onChange={e => setState(e.target.value)} />
}
