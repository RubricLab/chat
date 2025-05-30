'use server'

import { createActionExecutor } from '@rubriclab/actions'
import { actions } from '~/actions'

export const { execute } = createActionExecutor({ actions })
