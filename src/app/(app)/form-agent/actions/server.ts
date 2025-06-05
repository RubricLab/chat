'use server'

import { createActionExecutor } from '@rubriclab/actions'
import { actions } from '~/form-agent/actions'

export const { execute } = createActionExecutor({ actions })
