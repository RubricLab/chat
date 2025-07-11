import { genericFormBlock } from './genericForm'
import { genericSelectBlock } from './genericSelect'

export const genericBlocks = {
	genericForm: { ...genericFormBlock, type: 'action' as const },
	genericSelect: { ...genericSelectBlock, type: 'action' as const }
}
