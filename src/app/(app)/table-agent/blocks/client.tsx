'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { staticBlocks } from '~/table-agent/blocks'
import { genericBlocks } from './generics'

export const { render } = createBlockRenderer({
	blocks: { ...staticBlocks, ...genericBlocks }
})
