import { createEventsClient } from '@rubriclab/events/client'
import { eventTypes } from './event-types'
export const { useEvents } = createEventsClient({ eventTypes })
