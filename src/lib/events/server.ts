import { createEventsServer } from '@rubriclab/events'
import env from '~/env'
import { eventTypes } from './types'

export const { publish, GET, maxDuration } = createEventsServer({
	eventTypes,
	redisURL: env.UPSTASH_REDIS_URL
})
