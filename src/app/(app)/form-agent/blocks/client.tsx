'use client'

import { createBlockRenderer } from '@rubriclab/blocks'
import { blocks } from '~/form-agent/blocks'

export const { render } = createBlockRenderer({ blocks })
