'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { blocks } from '~/website-agent/blocks'

export const { render } = createBlockRenderer({ blocks })
