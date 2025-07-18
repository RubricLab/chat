'use server'

import { createActionExecutor } from '@rubriclab/actions'
import { actions } from '~/table-agent/actions'

export const { execute } = createActionExecutor({ actions })
