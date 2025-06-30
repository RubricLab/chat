'use server'

import { execute } from '~/calculator-agent/actions/server'
import { type Chain, drill } from './index'
import { ReactNode } from 'react'

export async function executeChain(chain: Chain) {
	return await drill(chain, action => params => execute({ action, params })) as ReactNode
}
