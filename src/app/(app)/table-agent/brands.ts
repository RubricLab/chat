import { brand } from '@rubriclab/shapes'
import type { ZodType } from 'zod'

export const raw = brand('raw', false)

export type Raw<Type extends ZodType> = ReturnType<typeof raw<Type>>
