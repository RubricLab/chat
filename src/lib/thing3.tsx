/* blocks/index.ts */
import React from 'react'
import type { z } from 'zod'

/* generic factory */
export type BlockFactory<I extends z.ZodTypeAny, O extends z.ZodTypeAny> = (arg: O) => {
	schema: I
	output: O
	render: (
		props: z.infer<I>,
		emit: (v: z.infer<O>) => void,
		renderChild: (n: JSX.Element) => JSX.Element
	) => JSX.Element
}

/* create a renderer from a set of factories (registry) */
export function createBlocksRenderer<F extends Record<string, BlockFactory<any, any>>>(
	registry: F
) {
	function render<
		K extends keyof F,
		S extends z.ZodTypeAny,
		Desc extends ReturnType<F[K]>,
		Props extends z.infer<Desc['schema']>
	>(inv: {
		use: F[K] /* the factory itself          */
		with: S /* concrete schema argument    */
		props: Props /* checked against -> schema   */
	}): JSX.Element {
		const desc = inv.use(inv.with) as Desc // tie S to output
		const safe = desc.schema.parse(inv.props) // props validated
		return desc.render(
			safe,
			() => {},
			n => n
		)
	}

	return { render }
}
