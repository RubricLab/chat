'use server'

import { createActionExecutor } from '@rubriclab/actions'
import { actions } from '~/calculator-agent/actions'

export const { execute } = createActionExecutor({ actions })
