'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { staticBlocks } from '~/form-agent/blocks'

export const { render } = createBlockRenderer({ blocks: staticBlocks })
