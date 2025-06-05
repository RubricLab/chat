import { render } from '~/website-agent/blocks/client'
import { type Chain, drill } from './index'

export async function executeChain(chain: Chain) {
	return drill(chain, key => {
		return async input =>
			(await render({
				block: key,
				props: input,
				emit(_v) {
					// We aren't doing anything functional in this demo (like inputs).
				}
			})) as 'ReactNode'
	})
}
