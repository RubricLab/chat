import { createActionsExecutor } from '../actions'
import { actions } from '../actions-def'
import { blocks } from '../blocks-def'
import { createChainRuntime, createChainSchema } from '../chains'

const schemaTools = createChainSchema({ ...actions, ...blocks })
const exec = createActionsExecutor(actions)
const runtime = createChainRuntime({ ...actions, ...blocks }, exec)

/* ← imagine rawJson came from OpenAI */
export async function POST(rawJson: string) {
	const { chain } = schemaTools.$parseRaw(rawJson)
	const hydrated = await runtime.hydrate(chain)
	return JSON.stringify({ chain: hydrated })
}
