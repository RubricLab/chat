'use server'

import { execute } from '~/calculator-agent/actions/server'
import type { CalculatorAgentResponseEvent } from '~/calculator-agent/agent'
import { drill } from './index'

export async function executeChain(chain: CalculatorAgentResponseEvent['message']['chain']) {
	return drill(chain, key => {
		return async input => await execute({ action: key, params: input })
	})
}
