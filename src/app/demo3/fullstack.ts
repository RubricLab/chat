import { type AnyActions, createActionsExecutor } from '@rubriclab/actions'
import { z } from 'zod'
import { type BlockDefinition, createBlocksExecutor } from './blocks'
import { zodToJsonSchema } from './common'

export function createFullstackExecutor<
	Acts extends AnyActions,
	Bs extends Record<string, BlockDefinition>
>(actions: Acts, blocks: Bs) {
	const actionsExec = createActionsExecutor(actions)
	const blocksExec = createBlocksExecutor<Acts, Bs>(blocks, actionsExec)

	/* merge schemas: blocksExec already references ActionUnion so we only
     need to expose a root schema that equals blocksExec.schema */
	const schema = blocksExec.schema
	const response_format = (actionsExec as any).makeCustomResponseFormat(
		zodToJsonSchema(schema),
		(txt: string) => schema.parse(JSON.parse(txt))
	)

	return {
		/* run from code */
		render: blocksExec.render,
		/* run from LLM */
		renderFromModel: async (txt: string) => blocksExec.render(response_format.$parseRaw(txt).render),
		schema,
		response_format,
		/* … re-expose helpers if you like … */
		actionsExecutor: actionsExec,
		blocksExecutor: blocksExec
	}
}
