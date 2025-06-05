import type { WebsiteAgentResponseEvent } from '~/website-agent/agent'
import { render } from '~/website-agent/blocks/client'
import { drill } from './index'

export async function executeChain(chain: WebsiteAgentResponseEvent['message']['chain']) {
	return drill(chain, key => {
		return async input =>
			(await render({
				block: key,
				props: input,
				emit(_v) {
					// We aren't doing anything functional in this demo (like inputs). (yet...)
				}
			})) as 'ReactNode'
	})
}
