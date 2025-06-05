'use server'

import { createActionExecutor } from '@rubriclab/actions'
import { actions } from '~/db-agent/actions'

export const { execute } = createActionExecutor({ actions })
