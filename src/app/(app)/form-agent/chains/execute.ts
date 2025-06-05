'use server'

import { execute } from '~/form-agent/actions/server'
import type { FormAgentResponseEvent } from '~/form-agent/agent'
import { drill } from './index'

export async function executeChain(chain: FormAgentResponseEvent['message']['chain']) {
	return drill(chain, key => {
		return async input => await execute({ action: key, params: input })
	})
}
