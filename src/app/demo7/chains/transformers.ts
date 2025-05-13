import type { z } from 'zod'

export type Transformer<
	In extends z.ZodTypeAny = z.ZodTypeAny,
	Out extends z.ZodTypeAny = z.ZodTypeAny,
	RuntimeExtras = unknown
> = {
	kind: 'action' | 'block'
	schema: { input: In; output: Out }
	impl: RuntimeExtras
}
