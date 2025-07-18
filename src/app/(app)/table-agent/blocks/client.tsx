'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { genericBlocks, staticBlocks } from '~/table-agent/blocks'

export const { render } = createBlockRenderer({
	blocks: { ...staticBlocks, ...genericBlocks }
})
