'use client'

import { type ReactNode, useState } from 'react'
import { blocks } from '../blocks'
import { useEvents } from '../events.client'
import { createRenderer } from '../lib/blocks'

const { render } = createRenderer({ blocks })

export function UI() {
	const [ui, setUI] = useState<ReactNode>()
	useEvents({
		id: 'main',
		on: {
			block: ({ block, props }) => {
				setUI(render({ block, props }))
			}
		}
	})

	return <div>{ui}</div>
}
