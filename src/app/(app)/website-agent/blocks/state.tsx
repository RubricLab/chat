'use client'

import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import type { z } from 'zod/v4'

export function useStateful<T extends z.ZodTypeAny, S = z.infer<T>>(
	_type: T,
	initialState: S,
	Component: React.ComponentType<{
		state: S
		setState: Dispatch<SetStateAction<S>>
	}>
) {
	const [state, setState] = useState<S>(initialState)

	const element = useMemo(() => <Component state={state} setState={setState} />, [Component, state])

	return { element, state }
}
