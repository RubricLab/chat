import React from 'react'
import { createBlocksRenderer } from './blocks'
import { blocks } from './blocks-def'
import { createChainSchema } from './chains'

const schema = createChainSchema(blocks)
const { RenderChain } = createBlocksRenderer(blocks, {
	callThunk: thunk => fetch('/demo7/execute', { method: 'POST', body: JSON.stringify(thunk) })
})

export function UI({ json }: { json: string }) {
	const { chain } = schema.zodSchema.parse(JSON.parse(json))
	return <RenderChain chain={chain} />
}
