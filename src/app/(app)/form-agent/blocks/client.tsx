'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { genericBlocks, staticBlocks } from '~/form-agent/blocks'

export const { render } = createBlockRenderer({ blocks: { ...staticBlocks, ...genericBlocks } })
