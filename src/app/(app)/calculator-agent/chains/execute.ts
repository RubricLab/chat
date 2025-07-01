'use server'
import { drill, type Chain } from './index';

import {execute} from '../actions/server'

export async function executeChain(chain: Chain) {
	return drill(chain, (action) => (params) => execute({action, params}))
}