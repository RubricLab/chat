'use server'

import type { ReactNode } from 'react'
import { execute } from '../actions/server'
import { type Chain, drill } from './index'

export async function executeChain(chain: Chain) {
	return drill(chain, action => params => execute({ action, params })) as ReactNode
}
